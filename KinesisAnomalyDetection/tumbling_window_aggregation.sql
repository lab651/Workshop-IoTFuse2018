-- Creates an output stream and defines a schema
CREATE OR REPLACE STREAM "DESTINATION_SQL_STREAM" (
  "device" VARCHAR(16),
  "time" TIMESTAMP,
  "acc-z-min"   DOUBLE,
  "acc-z-max"   DOUBLE,
  "acc-z-mean"  DOUBLE,
  "acc-z-stdev" DOUBLE,
  "acc-y-min"   DOUBLE,
  "acc-y-max"   DOUBLE,
  "acc-y-mean"  DOUBLE,
  "acc-y-stdev" DOUBLE,
  "acc-x-min"   DOUBLE,
  "acc-x-max"   DOUBLE,
  "acc-x-mean"  DOUBLE,
  "acc-x-stdev" DOUBLE,
  "gyro-z-min"   DOUBLE,
  "gyro-z-max"   DOUBLE,
  "gyro-z-mean"  DOUBLE,
  "gyro-z-stdev" DOUBLE,
  "gyro-y-min"   DOUBLE,
  "gyro-y-max"   DOUBLE,
  "gyro-y-mean"  DOUBLE,
  "gyro-y-stdev" DOUBLE,
  "gyro-x-min"   DOUBLE,
  "gyro-x-max"   DOUBLE,
  "gyro-x-mean"  DOUBLE,
  "gyro-x-stdev" DOUBLE);

-- Sort records by descending anomaly score, insert into output stream
CREATE OR REPLACE PUMP "OUTPUT_PUMP" AS INSERT INTO "DESTINATION_SQL_STREAM"
SELECT STREAM "device", TO_TIMESTAMP(MAX("acc_timestamp")),
    MIN("acc_z"), MAX("acc_z"), AVG("acc_z"), STDDEV_SAMP("acc_z"), 
    MIN("acc_y"), MAX("acc_y"), AVG("acc_y"), STDDEV_SAMP("acc_y"), 
    MIN("acc_x"), MAX("acc_x"), AVG("acc_x"), STDDEV_SAMP("acc_x"), 
    MIN("gyro_z"), MAX("gyro_z"), AVG("gyro_z"), STDDEV_SAMP("gyro_z"), 
    MIN("gyro_y"), MAX("gyro_y"), AVG("gyro_y"), STDDEV_SAMP("gyro_y"), 
    MIN("gyro_x"), MAX("gyro_x"), AVG("gyro_x"), STDDEV_SAMP("gyro_x")
    FROM "SOURCE_SQL_STREAM_001" AS s
    GROUP BY "device", STEP(MONOTONIC(TO_TIMESTAMP(s."acc_timestamp")) BY INTERVAL '3' SECOND);
