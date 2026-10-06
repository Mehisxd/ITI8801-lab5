CREATE TABLE IF NOT EXISTS exercises (
    id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    repetitions INTEGER NOT NULL
        CHECK (repetitions >= 0 AND repetitions <= 1000000)
);