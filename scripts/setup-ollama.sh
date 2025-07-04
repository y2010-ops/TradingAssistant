#!/bin/bash

# AI Trading Assistant - Ollama Setup Script
# This script automates the installation and configuration of Ollama with free AI models

set -e

echo "🤖 AI Trading Assistant - Free AI Models Setup"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check system requirements
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check available memory
    if command -v free >/dev/null 2>&1; then
        TOTAL_MEM=$(free -g | awk '/^Mem:/{print $2}')
        print_status "Available RAM: ${TOTAL_MEM}GB"
        
        if [ "$TOTAL_MEM" -lt 4 ]; then
            print_warning "Low memory detected. Consider using browser-based AI only."
        elif [ "$TOTAL_MEM" -lt 8 ]; then
            print_warning "Limited memory. Recommend using lightweight models (gemma:2b)."
        else
            print_success "Sufficient memory for all AI models."
        fi
    fi
    
    # Check available disk space
    AVAILABLE_SPACE=$(df -BG . | awk 'NR==2 {print $4}' | sed 's/G//')
    print_status "Available disk space: ${AVAILABLE_SPACE}GB"
    
    if [ "$AVAILABLE_SPACE" -lt 10 ]; then
        print_warning "Low disk space. AI models require 5-10GB."
    fi
}

# Install Ollama
install_ollama() {
    print_status "Installing Ollama..."
    
    if command -v ollama >/dev/null 2>&1; then
        print_success "Ollama already installed."
        ollama --version
    else
        print_status "Downloading and installing Ollama..."
        curl -fsSL https://ollama.ai/install.sh | sh
        
        if command -v ollama >/dev/null 2>&1; then
            print_success "Ollama installed successfully!"
        else
            print_error "Failed to install Ollama. Please install manually."
            exit 1
        fi
    fi
}

# Start Ollama service
start_ollama() {
    print_status "Starting Ollama service..."
    
    # Check if Ollama is already running
    if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
        print_success "Ollama is already running."
    else
        print_status "Starting Ollama server..."
        ollama serve &
        OLLAMA_PID=$!
        
        # Wait for Ollama to start
        for i in {1..30}; do
            if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
                print_success "Ollama server started successfully!"
                break
            fi
            sleep 1
        done
        
        if ! curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
            print_error "Failed to start Ollama server."
            exit 1
        fi
    fi
}

# Download AI models based on system capabilities
download_models() {
    print_status "Downloading AI models..."
    
    # Get system memory
    if command -v free >/dev/null 2>&1; then
        TOTAL_MEM=$(free -g | awk '/^Mem:/{print $2}')
    else
        TOTAL_MEM=8  # Default assumption
    fi
    
    # Model selection based on available memory
    if [ "$TOTAL_MEM" -ge 16 ]; then
        MODELS=("llama3.2:3b" "mistral:7b" "gemma:2b")
        print_status "High memory system detected. Downloading multiple models..."
    elif [ "$TOTAL_MEM" -ge 8 ]; then
        MODELS=("llama3.2:3b" "gemma:2b")
        print_status "Medium memory system detected. Downloading recommended models..."
    elif [ "$TOTAL_MEM" -ge 4 ]; then
        MODELS=("gemma:2b")
        print_status "Limited memory system detected. Downloading lightweight model..."
    else
        print_warning "Very low memory. Skipping local models. Will use browser-based AI only."
        return 0
    fi
    
    # Download each model
    for model in "${MODELS[@]}"; do
        print_status "Downloading $model..."
        
        if ollama list | grep -q "$model"; then
            print_success "$model already downloaded."
        else
            ollama pull "$model"
            if [ $? -eq 0 ]; then
                print_success "$model downloaded successfully!"
            else
                print_error "Failed to download $model"
            fi
        fi
    done
}

# Test AI models
test_models() {
    print_status "Testing AI models..."
    
    # Get list of downloaded models
    MODELS=$(ollama list | grep -v "NAME" | awk '{print $1}' | head -3)
    
    if [ -z "$MODELS" ]; then
        print_warning "No local models found. Browser-based AI will be used."
        return 0
    fi
    
    # Test each model
    for model in $MODELS; do
        print_status "Testing $model..."
        
        response=$(ollama run "$model" "What is the stock market?" --timeout 10s 2>/dev/null || echo "timeout")
        
        if [ "$response" != "timeout" ] && [ -n "$response" ]; then
            print_success "$model is working correctly!"
        else
            print_warning "$model test failed or timed out."
        fi
    done
}

# Configure environment
configure_environment() {
    print_status "Configuring environment..."
    
    # Check if .env file exists
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_success "Created .env file from template."
        else
            print_warning ".env.example not found. Please create .env manually."
        fi
    fi
    
    # Update .env with Ollama configuration
    if [ -f ".env" ]; then
        if ! grep -q "OLLAMA_URL" .env; then
            echo "OLLAMA_URL=http://localhost:11434" >> .env
        fi
        
        if ! grep -q "ENABLE_LOCAL_LLM" .env; then
            echo "ENABLE_LOCAL_LLM=true" >> .env
        fi
        
        # Set default model based on what's available
        FIRST_MODEL=$(ollama list | grep -v "NAME" | awk '{print $1}' | head -1)
        if [ -n "$FIRST_MODEL" ]; then
            if ! grep -q "DEFAULT_LLM_MODEL" .env; then
                echo "DEFAULT_LLM_MODEL=$FIRST_MODEL" >> .env
            fi
        fi
        
        print_success "Environment configured."
    fi
}

# Create systemd service (Linux only)
create_service() {
    if [ "$(uname)" = "Linux" ] && command -v systemctl >/dev/null 2>&1; then
        print_status "Creating systemd service for Ollama..."
        
        SERVICE_FILE="/etc/systemd/system/ollama.service"
        
        if [ ! -f "$SERVICE_FILE" ]; then
            sudo tee "$SERVICE_FILE" > /dev/null <<EOF
[Unit]
Description=Ollama AI Model Server
After=network.target

[Service]
Type=simple
User=$USER
ExecStart=$(which ollama) serve
Restart=always
RestartSec=3
Environment=OLLAMA_MAX_LOADED_MODELS=2
Environment=OLLAMA_MAX_QUEUE=4

[Install]
WantedBy=multi-user.target
EOF
            
            sudo systemctl daemon-reload
            sudo systemctl enable ollama
            print_success "Ollama service created and enabled."
        else
            print_success "Ollama service already exists."
        fi
    fi
}

# Performance optimization
optimize_performance() {
    print_status "Applying performance optimizations..."
    
    # Set environment variables for optimal performance
    export OLLAMA_MAX_LOADED_MODELS=2
    export OLLAMA_MAX_QUEUE=4
    export OLLAMA_NUM_PARALLEL=1
    
    # Create optimization script
    cat > ollama-optimize.sh <<EOF
#!/bin/bash
# Ollama Performance Optimization Script

# Memory management
export OLLAMA_MAX_LOADED_MODELS=2
export OLLAMA_MAX_QUEUE=4
export OLLAMA_NUM_PARALLEL=1

# GPU acceleration (if available)
if command -v nvidia-smi >/dev/null 2>&1; then
    export OLLAMA_GPU=1
    echo "GPU acceleration enabled"
fi

# Start Ollama with optimizations
ollama serve
EOF
    
    chmod +x ollama-optimize.sh
    print_success "Performance optimization script created."
}

# Generate usage instructions
generate_instructions() {
    print_status "Generating usage instructions..."
    
    cat > OLLAMA_USAGE.md <<EOF
# Ollama Usage Instructions

## Available Models
$(ollama list)

## Basic Commands

### Start Ollama Server
\`\`\`bash
ollama serve
\`\`\`

### List Models
\`\`\`bash
ollama list
\`\`\`

### Run a Model
\`\`\`bash
ollama run llama3.2:3b "Analyze RELIANCE stock"
\`\`\`

### API Usage
\`\`\`bash
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2:3b",
  "prompt": "What is technical analysis?",
  "stream": false
}'
\`\`\`

## Performance Tips

1. **Memory Management**: Keep only 1-2 models loaded
2. **Model Selection**: Use smaller models for faster responses
3. **GPU Acceleration**: Enable if NVIDIA GPU available
4. **Concurrent Requests**: Limit to avoid memory issues

## Troubleshooting

### Model Not Loading
\`\`\`bash
ollama pull <model-name>
\`\`\`

### High Memory Usage
\`\`\`bash
export OLLAMA_MAX_LOADED_MODELS=1
\`\`\`

### Server Not Starting
\`\`\`bash
pkill ollama
ollama serve
\`\`\`
EOF
    
    print_success "Usage instructions created: OLLAMA_USAGE.md"
}

# Main execution
main() {
    echo
    print_status "Starting AI Trading Assistant setup..."
    echo
    
    check_requirements
    echo
    
    install_ollama
    echo
    
    start_ollama
    echo
    
    download_models
    echo
    
    test_models
    echo
    
    configure_environment
    echo
    
    create_service
    echo
    
    optimize_performance
    echo
    
    generate_instructions
    echo
    
    print_success "🎉 Setup completed successfully!"
    echo
    print_status "Next steps:"
    echo "1. Start your trading assistant: npm run dev"
    echo "2. Open browser: http://localhost:5173"
    echo "3. Check AI status in the dashboard"
    echo "4. Read OLLAMA_USAGE.md for detailed instructions"
    echo
    print_status "Available models:"
    ollama list
    echo
    print_success "Your AI Trading Assistant is ready! 🚀"
}

# Run main function
main "$@"