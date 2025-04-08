/*
  # Create users table and security policies

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - matches Firebase auth UID
      - `role` (text)
      - `bio` (text)
      - `interests` (text[])
      - `expertise` (text[])
      - `photo_url` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on users table
    - Add policies for authenticated users to:
      - Read their own data
      - Update their own data
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  role text NOT NULL,
  bio text,
  interests text[],
  expertise text[],
  photo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id::text);

-- Allow users to update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id::text)
  WITH CHECK (auth.uid() = id::text);

-- Allow users to insert their own data
CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id::text);