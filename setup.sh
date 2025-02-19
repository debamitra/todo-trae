#!/bin/bash

echo "Supabase Project Setup Script"
echo "==========================="
echo ""

# Function to validate input is not empty
validate_input() {
    if [ -z "$1" ]; then
        echo "Error: Input cannot be empty"
        return 1
    fi
    return 0
}

# Get Supabase configuration
echo "Please enter your Supabase configuration values:"
echo "(You can find these in your Supabase project settings)"
echo ""

read -p "Supabase Project URL: " SUPABASE_URL
while ! validate_input "$SUPABASE_URL"; do
    read -p "Supabase Project URL: " SUPABASE_URL
done

read -p "Supabase Anon Key: " SUPABASE_ANON_KEY
while ! validate_input "$SUPABASE_ANON_KEY"; do
    read -p "Supabase Anon Key: " SUPABASE_ANON_KEY
done

# Create/Update .env file
echo "Updating .env file..."
cat > .env << EOL
VITE_SUPABASE_URL=${SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
EOL

# Make the script executable
chmod +x setup.sh

echo ""
echo "Setup completed successfully!"
echo "Your .env file has been updated with the Supabase configuration."
echo "You can now start the application using 'npm run dev'"