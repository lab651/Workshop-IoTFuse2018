package com.amazonaws.lambda.demo;

import java.util.Iterator;
import java.util.List;
import java.util.concurrent.TimeUnit;

import org.influxdb.InfluxDB;
import org.influxdb.InfluxDBFactory;
import org.influxdb.InfluxDB.ConsistencyLevel;
import org.influxdb.dto.BatchPoints;
import org.influxdb.dto.Point;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.KinesisEvent;
import com.amazonaws.services.lambda.runtime.events.KinesisEvent.KinesisEventRecord;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

public class LambdaFunctionHandler implements RequestHandler<KinesisEvent, Integer> {

    @Override
    public Integer handleRequest(KinesisEvent event, Context context) {
        context.getLogger().log("Input: " + event);

        
        ObjectMapper objectMapper = new ObjectMapper();
        try {
        	objectMapper.configure(DeserializationFeature.ACCEPT_FLOAT_AS_INT, false);
        	objectMapper.enable(DeserializationFeature. ACCEPT_SINGLE_VALUE_AS_ARRAY);
        
        for (KinesisEventRecord record : event.getRecords()) {
        	
        	String payload = new String(record.getKinesis().getData().array());
            context.getLogger().log("Payload: " + payload);
            
            
            List<DataElements> myObjectsList = objectMapper.readValue(payload, new TypeReference<List<DataElements>>(){});
            Iterator<DataElements> iter = myObjectsList.iterator();
            
            while(iter.hasNext()) {
            	
            
            	DataElements de = iter.next();
            	Acceleration acc = de.getAcceleration();
            	context.getLogger().log("ACCTIME: " + acc.getTimestamp() + " X:" + acc.getX() + "' Y:" + acc.getY());
            	Gyroscope gyro = de.getGyroscope();
            	context.getLogger().log("GYRPTIME: " + gyro.getTimestamp() + " X:" + gyro.getX() + "' Y:" + gyro.getY());
                
                InfluxDB influxDB = InfluxDBFactory.connect("YOUR_INFLUX_URL", "INFLUX_USER", "INFLUX_PASSWORD");
                
                BatchPoints batchPoints = BatchPoints
                				.database("YOUR_DB")
                				.tag("async", "true")
                				.consistency(ConsistencyLevel.ALL)
                				.build();
               
                Point point1 = Point.measurement("acc")
    					.time(acc.getTimestamp(), TimeUnit.MILLISECONDS)
    					.addField("accel-x", acc.getX())
    					.addField("accel-y", acc.getY())
    					.addField("accel-z", acc.getZ())
    					.build();
                
    			Point point2 = Point.measurement("gyro")
    					.time(gyro.getTimestamp(), TimeUnit.MILLISECONDS)
    					.addField("gyro-x", gyro.getX())
    					.addField("gyro-y", gyro.getY())
    					.addField("gyro-z", gyro.getZ())
    					.build();
                batchPoints.point(point1);
                batchPoints.point(point2);
                influxDB.write(batchPoints);
            }
        }
                
       } catch(Exception ex) {
            	ex.printStackTrace();
       }

        return event.getRecords().size();
    }
}
