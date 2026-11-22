-- Run once in the Supabase SQL editor.
CREATE TABLE profiles (
  id UUID PRIMARY KEY, -- same as the Supabase auth user id
  email TEXT NOT NULL UNIQUE, phone TEXT, name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE games (
  id SERIAL PRIMARY KEY, name TEXT NOT NULL UNIQUE,
  stations INT NOT NULL DEFAULT 2 CHECK (stations > 0), is_active BOOLEAN NOT NULL DEFAULT true
);
CREATE TABLE game_durations (
  game_id INT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  minutes INT NOT NULL CHECK (minutes > 0 AND minutes % 30 = 0),
  price INT NOT NULL CHECK (price >= 0),
  PRIMARY KEY (game_id, minutes)
);
CREATE TABLE settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  shop_open BOOLEAN NOT NULL DEFAULT false,
  open_time TIME NOT NULL DEFAULT '11:00', close_time TIME NOT NULL DEFAULT '22:00',
  booking_days_ahead INT NOT NULL DEFAULT 1, cutoff_minutes INT NOT NULL DEFAULT 5,
  reschedule_cutoff_hours INT NOT NULL DEFAULT 2, max_reschedules INT NOT NULL DEFAULT 1,
  stations INT NOT NULL DEFAULT 2 CHECK (stations BETWEEN 1 AND 20) -- shared by ALL games
);
CREATE TABLE bookings (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id),
  game_id INT NOT NULL REFERENCES games(id),
  booking_date DATE NOT NULL, start_time TIME NOT NULL, duration_minutes INT NOT NULL,
  amount INT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PENDING_PAYMENT','AWAITING_CONFIRMATION','CONFIRMED','REJECTED','EXPIRED','USED')),
  ticket_code TEXT NOT NULL UNIQUE,
  utr TEXT UNIQUE, -- full UTR; always masked when displayed
  hold_expires_at TIMESTAMPTZ, -- NULL while waiting with the shop OFF
  reminder_count INT NOT NULL DEFAULT 0, last_reminder_at TIMESTAMPTZ,
  reschedule_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), confirmed_at TIMESTAMPTZ, used_at TIMESTAMPTZ
);
CREATE INDEX idx_bookings_game_date ON bookings (game_id, booking_date);
CREATE TABLE reschedules (
  id BIGSERIAL PRIMARY KEY, booking_id BIGINT NOT NULL REFERENCES bookings(id),
  from_date DATE NOT NULL, from_time TIME NOT NULL, to_date DATE NOT NULL, to_time TIME NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE blocked_seats (
  id BIGSERIAL PRIMARY KEY, game_id INT REFERENCES games(id), -- optional: blocks are venue-wide
  booking_date DATE NOT NULL, start_time TIME NOT NULL, seats INT NOT NULL CHECK (seats > 0)
);
INSERT INTO settings DEFAULT VALUES;
INSERT INTO games (name) VALUES ('Takken Tag'), ('Takken 3');
INSERT INTO game_durations (game_id, minutes, price) SELECT id, 30, 35 FROM games;
INSERT INTO game_durations (game_id, minutes, price) SELECT id, 60, 60 FROM games;
