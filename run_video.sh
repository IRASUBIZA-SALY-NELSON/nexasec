#!/bin/bash

# Navigate to the project directory
cd /home/minister/Documents/CYBERSECURITY/NEXASEC

# Activate virtual environment
source venv/bin/activate

# Install required dependencies
echo "Installing MoviePy and dependencies..."
pip install setuptools>=65.0.0 Pillow==9.5.0 moviepy==1.0.3 imageio==2.31.1 imageio-ffmpeg==0.4.8

# Check if logo.png exists
if [ ! -f "logo.png" ]; then
    echo "Error: logo.png not found in current directory"
    exit 1
fi

# Run the video script
echo "Running video.py..."
python video.py

# Check if output was created
if [ -f "nexasec_intro.mp4" ]; then
    echo "Success! Video created: nexasec_intro.mp4"
    ls -lh nexasec_intro.mp4
else
    echo "Error: Video file was not created"
    exit 1
fi
