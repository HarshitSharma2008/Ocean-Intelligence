import sys
import json
import math
import os
import xarray as xr


GRID_DIR = os.path.join(
    os.path.dirname(__file__),
    "ocean_grid_deep"
)

MIN_DEPTH = 0.0
MAX_DEPTH = 6000.0


def output(data):
    print(json.dumps(data))
    sys.exit(0)


def get_float(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def clean_value(value):
    try:
        if hasattr(value, "item"):
            value = value.item()

        value = float(value)

        if math.isnan(value) or math.isinf(value):
            return None

        return value

    except (TypeError, ValueError):
        return None


def get_value(dataset, variable):
    if variable not in dataset:
        return None

    try:
        values = dataset[variable].values

        if values.size == 0:
            return None

        return clean_value(values.flat[0])

    except Exception:
        return None


def get_direction(u, v):
    if u is None or v is None:
        return None

    if abs(u) < 0.01 and abs(v) < 0.01:
        return "CALM"

    angle = math.degrees(
        math.atan2(v, u)
    )

    if angle < 0:
        angle += 360

    directions = [
        "E",
        "NE",
        "N",
        "NW",
        "W",
        "SW",
        "S",
        "SE"
    ]

    index = round(angle / 45) % 8

    return directions[index]


def get_chunk_value(value, minimum, maximum):
    if value == maximum:
        return maximum - 30

    return (
        math.floor(
            (value - minimum) / 30
        ) * 30
        + minimum
    )


def find_chunk(latitude, longitude):
    lat_min = get_chunk_value(
        latitude,
        -90,
        90
    )

    lon_min = get_chunk_value(
        longitude,
        -180,
        180
    )

    lat_max = lat_min + 30
    lon_max = lon_min + 30

    filename = (
        f"lat_{int(lat_min)}_{int(lat_max)}_"
        f"lon_{int(lon_min)}_{int(lon_max)}.nc"
    )

    filepath = os.path.join(
        GRID_DIR,
        filename
    )

    if not os.path.exists(filepath):
        return None

    return filepath


def get_temperature_range(depth):
    if depth <= 200:
        return {
            "normal_min": 15.0,
            "normal_max": 32.0,
            "critical_min": 5.0,
            "critical_max": 35.0
        }

    if depth <= 1000:
        return {
            "normal_min": 8.0,
            "normal_max": 28.0,
            "critical_min": 2.0,
            "critical_max": 32.0
        }

    if depth <= 4000:
        return {
            "normal_min": -1.0,
            "normal_max": 15.0,
            "critical_min": -2.0,
            "critical_max": 20.0
        }

    return {
        "normal_min": -2.0,
        "normal_max": 8.0,
        "critical_min": -3.0,
        "critical_max": 15.0
    }


def analyze_ocean_condition(
    temperature,
    salinity,
    current,
    depth
):
    critical = 0
    attention = 0

    temperature_range = get_temperature_range(
        depth
    )

    if temperature is not None:

        if (
            temperature < temperature_range["critical_min"]
            or temperature > temperature_range["critical_max"]
        ):
            critical += 1

        elif (
            temperature < temperature_range["normal_min"]
            or temperature > temperature_range["normal_max"]
        ):
            attention += 1

    if salinity is not None:

        if (
            salinity < 28.0
            or salinity > 40.0
        ):
            critical += 1

        elif (
            salinity < 32.0
            or salinity > 38.0
        ):
            attention += 1

    if current is not None:

        if current > 1.5:
            critical += 1

        elif current > 0.5:
            attention += 1

    if critical >= 2:
        return {
            "status": "CRITICAL",
            "level": "critical",
            "message": "Multiple marine parameters are outside the safe screening range."
        }

    if critical == 1:
        return {
            "status": "CRITICAL",
            "level": "critical",
            "message": "A marine parameter is outside the critical screening range."
        }

    if attention > 0:
        return {
            "status": "ATTENTION",
            "level": "attention",
            "message": "One or more marine parameters are outside the expected range."
        }

    return {
        "status": "NORMAL",
        "level": "normal",
        "message": "Marine parameters are within the expected screening range."
    }


def analyze_anomaly(
    temperature,
    salinity,
    current,
    depth
):
    anomalies = []

    temperature_range = get_temperature_range(
        depth
    )

    if temperature is not None:

        if (
            temperature < temperature_range["normal_min"]
            or temperature > temperature_range["normal_max"]
        ):
            anomalies.append("temperature")

    if salinity is not None:

        if (
            salinity < 32.0
            or salinity > 38.0
        ):
            anomalies.append("salinity")

    if current is not None:

        if current > 0.8:
            anomalies.append("current")

    anomalies = list(
        dict.fromkeys(anomalies)
    )

    if anomalies:

        parameter_text = ", ".join(
            anomalies
        )

        return {
            "detected": True,
            "status": "ANOMALY DETECTED",
            "message":
                f"Unusual {parameter_text} reading identified.",
            "parameters": anomalies
        }

    return {
        "detected": False,
        "status": "STABLE",
        "message":
            "No threshold-based anomaly detected.",
        "parameters": []
    }


def build_intelligence(
    temperature,
    salinity,
    current,
    depth
):
    return {
        "condition": analyze_ocean_condition(
            temperature,
            salinity,
            current,
            depth
        ),
        "anomaly": analyze_anomaly(
            temperature,
            salinity,
            current,
            depth
        )
    }


def read_single_depth(latitude, longitude, depth):

    filepath = find_chunk(
        latitude,
        longitude
    )

    if filepath is None:
        return {
            "success": False,
            "error": "Ocean data chunk not found."
        }

    try:

        with xr.open_dataset(filepath) as dataset:

            point = dataset.sel(
                latitude=latitude,
                longitude=longitude,
                depth=depth,
                method="nearest"
            )

            temperature = get_value(
                point,
                "thetao"
            )

            salinity = get_value(
                point,
                "so"
            )

            u = get_value(
                point,
                "uo"
            )

            v = get_value(
                point,
                "vo"
            )

            actual_depth = None

            if "depth" in point.coords:
                actual_depth = clean_value(
                    point["depth"].values
                )

            actual_latitude = None

            if "latitude" in point.coords:
                actual_latitude = clean_value(
                    point["latitude"].values
                )

            actual_longitude = None

            if "longitude" in point.coords:
                actual_longitude = clean_value(
                    point["longitude"].values
                )

        if (
            temperature is None
            and salinity is None
            and u is None
            and v is None
        ):
            return {
                "success": False,
                "error":
                    "No ocean data available at this location."
            }

        current = None

        if u is not None and v is not None:
            current = math.sqrt(
                (u * u) + (v * v)
            )

        direction = get_direction(
            u,
            v
        )

        intelligence = build_intelligence(
            temperature,
            salinity,
            current,
            depth
        )

        return {
            "success": True,
            "latitude": latitude,
            "longitude": longitude,
            "actualLatitude": actual_latitude,
            "actualLongitude": actual_longitude,
            "requestedDepth": depth,
            "actualDepth": actual_depth,
            "temperature": temperature,
            "salinity": salinity,
            "u": u,
            "v": v,
            "current": current,
            "direction": direction,
            "intelligence": intelligence,
            "source":
                "Local Copernicus Marine Global Ocean Physics Reanalysis",
            "dataDate": "2026-06-23"
        }

    except Exception as error:

        return {
            "success": False,
            "error": str(error)
        }


def read_profile(
    latitude,
    longitude,
    max_depth=6000
):

    filepath = find_chunk(
        latitude,
        longitude
    )

    if filepath is None:
        return {
            "success": False,
            "error": "Ocean data chunk not found."
        }

    try:

        with xr.open_dataset(filepath) as dataset:

            point = dataset.sel(
                latitude=latitude,
                longitude=longitude,
                method="nearest"
            )

            actual_latitude = clean_value(
                point["latitude"].values
            )

            actual_longitude = clean_value(
                point["longitude"].values
            )

            depth_values = point["depth"].values

            result_depths = []
            temperatures = []
            salinities = []
            currents = []

            for depth_value in depth_values:

                depth = clean_value(
                    depth_value
                )

                if depth is None:
                    continue

                if depth > max_depth:
                    continue

                try:

                    depth_point = point.sel(
                        depth=depth,
                        method="nearest"
                    )

                    temperature = get_value(
                        depth_point,
                        "thetao"
                    )

                    salinity = get_value(
                        depth_point,
                        "so"
                    )

                    u = get_value(
                        depth_point,
                        "uo"
                    )

                    v = get_value(
                        depth_point,
                        "vo"
                    )

                    current = None

                    if u is not None and v is not None:
                        current = math.sqrt(
                            (u * u) + (v * v)
                        )

                    if (
                        temperature is not None
                        or salinity is not None
                        or current is not None
                    ):

                        result_depths.append(
                            depth
                        )

                        temperatures.append(
                            temperature
                        )

                        salinities.append(
                            salinity
                        )

                        currents.append(
                            current
                        )

                except Exception:
                    continue

        if len(result_depths) == 0:

            return {
                "success": False,
                "error":
                    "No profile data available."
            }

        return {
            "success": True,
            "latitude": latitude,
            "longitude": longitude,
            "actualLatitude": actual_latitude,
            "actualLongitude": actual_longitude,
            "depths": result_depths,
            "temperature": temperatures,
            "salinity": salinities,
            "current": currents,
            "source":
                "Local Copernicus Marine Global Ocean Physics Reanalysis",
            "dataDate": "2026-06-23"
        }

    except Exception as error:

        return {
            "success": False,
            "error": str(error)
        }


def validate_coordinates(
    latitude,
    longitude
):

    if latitude is None:
        output({
            "success": False,
            "error": "Invalid latitude."
        })

    if longitude is None:
        output({
            "success": False,
            "error": "Invalid longitude."
        })

    if latitude < -90 or latitude > 90:
        output({
            "success": False,
            "error":
                "Latitude must be between -90 and 90."
        })

    if longitude < -180 or longitude > 180:
        output({
            "success": False,
            "error":
                "Longitude must be between -180 and 180."
        })


def main():

    if len(sys.argv) < 2:

        output({
            "success": False,
            "error": "Arguments are required."
        })

    mode = sys.argv[1]

    if mode == "profile":

        if len(sys.argv) < 4:

            output({
                "success": False,
                "error":
                    "Latitude and longitude are required."
            })

        latitude = get_float(
            sys.argv[2]
        )

        longitude = get_float(
            sys.argv[3]
        )

        max_depth = 6000.0

        if len(sys.argv) >= 5:

            parsed_depth = get_float(
                sys.argv[4]
            )

            if parsed_depth is not None:
                max_depth = parsed_depth

        validate_coordinates(
            latitude,
            longitude
        )

        if (
            max_depth < MIN_DEPTH
            or max_depth > MAX_DEPTH
        ):

            output({
                "success": False,
                "error":
                    "Depth must be between 0 and 6000 meters."
            })

        output(
            read_profile(
                latitude,
                longitude,
                max_depth
            )
        )

    else:

        if len(sys.argv) < 4:

            output({
                "success": False,
                "error":
                    "Latitude, longitude and depth are required."
            })

        latitude = get_float(
            sys.argv[1]
        )

        longitude = get_float(
            sys.argv[2]
        )

        depth = get_float(
            sys.argv[3]
        )

        validate_coordinates(
            latitude,
            longitude
        )

        if depth is None:

            output({
                "success": False,
                "error": "Invalid depth."
            })

        if (
            depth < MIN_DEPTH
            or depth > MAX_DEPTH
        ):

            output({
                "success": False,
                "error":
                    "Depth must be between 0 and 6000 meters."
            })

        result = read_single_depth(
            latitude,
            longitude,
            depth
        )

        output(result)


if __name__ == "__main__":
    main()