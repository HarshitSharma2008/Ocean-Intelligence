import os
import copernicusmarine

DATASET_ID = "cmems_mod_glo_phy_my_0.083deg_P1D-m"

OUTPUT_DIR = os.path.join(
    os.path.dirname(__file__),
    "ocean_grid_deep"
)

os.makedirs(OUTPUT_DIR, exist_ok=True)

LAT_STEP = 30
LON_STEP = 30

START_DATE = "2026-06-23T00:00:00"
END_DATE = "2026-06-23T00:00:00"

DEPTH_MIN = 100
DEPTH_MAX = 500

variables = [
    "thetao",
    "so",
    "uo",
    "vo"
]

total = 0

for lat_min in range(-90, 90, LAT_STEP):

    lat_max = min(
        lat_min + 30,
        90
    )

    for lon_min in range(-180, 180, LON_STEP):

        lon_max = min(
            lon_min + 30,
            180
        )

        total += 1

        filename = (
            f"lat_{lat_min}_{lat_max}_"
            f"lon_{lon_min}_{lon_max}.nc"
        )

        filepath = os.path.join(
            OUTPUT_DIR,
            filename
        )

        if os.path.exists(filepath):
            print(f"SKIP {total}/72: {filename}")
            continue

        print()
        print(
            f"Downloading {total}/72: "
            f"Lat {lat_min} to {lat_max}, "
            f"Lon {lon_min} to {lon_max}"
        )

        try:

            copernicusmarine.subset(
                dataset_id=DATASET_ID,
                variables=variables,

                minimum_longitude=lon_min,
                maximum_longitude=lon_max,

                minimum_latitude=lat_min,
                maximum_latitude=lat_max,

                minimum_depth=DEPTH_MIN,
                maximum_depth=DEPTH_MAX,

                start_datetime=START_DATE,
                end_datetime=END_DATE,

                coordinates_selection_method="nearest",

                output_directory=OUTPUT_DIR,
                output_filename=filename,

                netcdf_compression_level=4
            )

            print(f"DONE: {filename}")

        except Exception as error:

            print(f"FAILED: {filename}")
            print(error)

print()
print("==============================")
print("Deep ocean grid finished")
print("==============================")
print()
print(f"Location: {OUTPUT_DIR}")