// --- SmartFarm Express API --- //

const express = require("express");
const app = express();

const Joi = require("joi");

// Allow JSON body parsing
app.use(express.json());

app.use((req, res, next) => {
  req.requestId = Math.random().toString(36).substring(2, 8);
  req._startAt = Date.now();
  next();
});

// --- Simple logging middleware (we'll refine later) --- //
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});




// --- Step 2: Object Model Definition --- //

// Array of sensors (simulated in-memory database)
const sensors = [
  { id: 1, location: "Field A", type: "temperature", status: "active" },
  { id: 2, location: "Field B", type: "humidity", status: "inactive" }
];

// Array of readings (each belongs to a sensor)
const readings = [
  { id: 1, sensorId: 1, timestamp: "2025-11-01T10:00:00Z", value: 23.5 },
  { id: 2, sensorId: 1, timestamp: "2025-11-01T11:00:00Z", value: 24.0 }
];

// Temporary test route to verify the data model
app.get("/api/sensors", (req, res) => {
  res.send(sensors);
});

app.get("/api/fail", (req, res, next) => {
  const err = new Error("Simulated failure");
  err.statusCode = 500;
  next(err);
});

// --- Step 4: Input Validation with Joi --- //

const sensorSchema = Joi.object({
  location: Joi.string().min(3).required(),
  type: Joi.string().valid("temperature", "humidity", "moisture").required(),
  status: Joi.string().valid("active", "inactive").required()
});

// --- Step 3: CRUD Routes for Sensors --- //

// GET all sensors
app.get("/api/sensors", (req, res) => {
  res.json(sensors);
});

// GET a specific sensor by ID
app.get("/api/sensors/:id", (req, res) => {
  const sensor = sensors.find(s => s.id === parseInt(req.params.id));
  if (!sensor)
    return res.status(404).send("Sensor with given ID not found");
  res.json(sensor);
});

/* POST create a new sensor
app.post("/api/sensors", (req, res) => {
  const { location, type, status } = req.body;
  if (!location || !type || !status)
    return res.status(400).send("All fields (location, type, status) are required");

  const newSensor = {
    id: sensors.length ? sensors[sensors.length - 1].id + 1 : 1,
    location,
    type,
    status
  };

  sensors.push(newSensor);
  res.status(201).json(newSensor);
});

// PUT update an existing sensor
app.put("/api/sensors/:id", (req, res) => {
  const sensor = sensors.find(s => s.id === parseInt(req.params.id));
  if (!sensor)
    return res.status(404).send("Sensor with given ID not found");

  const { location, type, status } = req.body;
  if (!location || !type || !status)
    return res.status(400).send("All fields (location, type, status) are required");

  sensor.location = location;
  sensor.type = type;
  sensor.status = status;

  res.json(sensor);
});
*/
// POST create a new sensor (with Joi validation)
app.post("/api/sensors", (req, res) => {
  const { error } = sensorSchema.validate(req.body);
  if (error)
    return res.status(400).send(error.details[0].message);

  const newSensor = {
    id: sensors.length ? sensors[sensors.length - 1].id + 1 : 1,
    location: req.body.location,
    type: req.body.type,
    status: req.body.status
  };

  sensors.push(newSensor);
  res.status(201).json(newSensor);
});

// PUT update an existing sensor (with Joi validation)
app.put("/api/sensors/:id", (req, res) => {
  const sensor = sensors.find(s => s.id === parseInt(req.params.id));
  if (!sensor)
    return res.status(404).send("Sensor with given ID not found");

  const { error } = sensorSchema.validate(req.body);
  if (error)
    return res.status(400).send(error.details[0].message);

  sensor.location = req.body.location;
  sensor.type = req.body.type;
  sensor.status = req.body.status;

  res.json(sensor);
});


// DELETE remove a sensor
app.delete("/api/sensors/:id", (req, res) => {
  const sensorIndex = sensors.findIndex(s => s.id === parseInt(req.params.id));
  if (sensorIndex === -1)
    return res.status(404).send("Sensor with given ID not found");

  const deleted = sensors.splice(sensorIndex, 1);
  res.json(deleted[0]);
});

// --- Step 5: Nested Routes for Readings --- //

// GET all readings for a given sensor
app.get("/api/sensors/:id/readings", (req, res) => {
  const sensorId = parseInt(req.params.id);
  const sensor = sensors.find(s => s.id === sensorId);
  if (!sensor)
    return res.status(404).send("Sensor with given ID not found");

  const sensorReadings = readings.filter(r => r.sensorId === sensorId);
  res.json(sensorReadings);
});

// POST add a new reading for a given sensor
app.post("/api/sensors/:id/readings", (req, res) => {
  const sensorId = parseInt(req.params.id);
  const sensor = sensors.find(s => s.id === sensorId);
  if (!sensor)
    return res.status(404).send("Sensor with given ID not found");

  // Validate reading input
  const { timestamp, value } = req.body;
  if (!timestamp || value === undefined)
    return res.status(400).send("Both timestamp and value are required");

  const newReading = {
    id: readings.length ? readings[readings.length - 1].id + 1 : 1,
    sensorId,
    timestamp,
    value
  };

  readings.push(newReading);
  res.status(201).json(newReading);
});

// --- Step 6: Filtering via Query Parameters --- //

/*app.get("/api/readings", (req, res) => {
  let filtered = readings;
  const { type, minValue, maxValue } = req.query;

  console.log("Incoming query params:", req.query);
  console.log("Raw minValue =", minValue, "| type:", typeof minValue);

  // Filter by sensor type
  if (type) {
    filtered = filtered.filter(r => {
      const sensor = sensors.find(s => s.id === r.sensorId);
      return sensor && sensor.type === type;
    });
  }

  // Filter by value range (numeric comparison)
  if (minValue) {
    filtered = filtered.filter(r => {
      console.log(`Checking reading value=${r.value} against minValue=${minValue}`);
      return Number(r.value) >= Number(minValue);
    });
  }

  if (maxValue) {
    filtered = filtered.filter(r => Number(r.value) <= Number(maxValue));
  }

  console.log("Filtered result:", filtered);
  res.json(filtered);
});
*/

// --- Graduate Task (a): Pagination + Advanced Filtering --- //

app.get("/api/readings", (req, res, next) => {
  try {
    let { page = 1, limit = 10, type, minValue, maxValue, from, to } = req.query;

    // Convert numeric values
    page = Number(page);
    limit = Number(limit);
    if (isNaN(page) || page < 1) {
      const err = new Error("page must be an integer ≥ 1");
      err.statusCode = 400;
      throw err;
    }
    if (isNaN(limit) || limit < 1 || limit > 100) {
      const err = new Error("limit must be between 1 and 100");
      err.statusCode = 400;
      throw err;
    }

    // Start with all readings
    let filtered = readings;

    // --- Filtering ---
    if (type) {
      const allowedTypes = ["temperature", "humidity", "moisture"];
      if (!allowedTypes.includes(type)) {
        const err = new Error("Invalid type: must be one of temperature, humidity, or moisture");
        err.statusCode = 400;
        throw err;
      }
      filtered = filtered.filter(r => {
        const sensor = sensors.find(s => s.id === r.sensorId);
        return sensor && sensor.type === type;
      });
    }

    if (minValue && isNaN(Number(minValue))) {
      const err = new Error("minValue must be a number");
      err.statusCode = 400;
      throw err;
    }

    if (maxValue && isNaN(Number(maxValue))) {
      const err = new Error("maxValue must be a number");
      err.statusCode = 400;
      throw err;
    }

    if (minValue && maxValue && Number(minValue) > Number(maxValue)) {
      const err = new Error("minValue cannot exceed maxValue");
      err.statusCode = 400;
      throw err;
    }

    // Apply numeric filtering
    if (minValue) filtered = filtered.filter(r => r.value >= Number(minValue));
    if (maxValue) filtered = filtered.filter(r => r.value <= Number(maxValue));

    // --- Date range filtering ---
    if (from) {
      const fromDate = new Date(from);
      if (isNaN(fromDate)) {
        const err = new Error("Invalid date format for 'from'");
        err.statusCode = 400;
        throw err;
      }
      filtered = filtered.filter(r => new Date(r.timestamp) >= fromDate);
    }

    if (to) {
      const toDate = new Date(to);
      if (isNaN(toDate)) {
        const err = new Error("Invalid date format for 'to'");
        err.statusCode = 400;
        throw err;
      }
      filtered = filtered.filter(r => new Date(r.timestamp) <= toDate);
    }

    // --- Pagination ---
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const results = filtered.slice(startIndex, endIndex);

    const response = {
      page,
      pageSize: limit,
      totalItems,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      results
    };

    res.json(response);
  } catch (err) {
    next(err);
  }
});


// --- Temporary route to test 500 Internal Server Error --- //
app.get("/api/error", (req, res, next) => {
  next(new Error("Manual test error"));
});
/*
// --- Error Handling Middleware --- //
app.use((err, req, res, next) => {
  console.error("[ERROR]", err.message);
  res.status(500).send("Something went wrong on the server!");
});
*/
// --- Graduate Task (b): Centralized Error Middleware --- //
app.use((err, req, res, next) => {
  const duration = Date.now() - (req._startAt || Date.now());
  const status = err.statusCode || 500;

  const payload = {
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
    path: req.originalUrl,
    method: req.method,
    status,
    message: err.message || "Internal Server Error"
  };

  console.error("ERROR", {
    ...payload,
    durationMs: duration
  });

  // Include stack trace only in development
  if (process.env.NODE_ENV === "development" && err.stack) {
    payload.stack = err.stack;
  }

  res.status(status).json(payload);
});



// --- Start server --- //
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on ${port}...`));
