#!/bin/bash

# Project root directory
PROJECT_ROOT="project-root"

# Create main directories
mkdir -p "$PROJECT_ROOT/{config,src,tests,.env,.gitignore,README.md}"

# Create config subdirectories
mkdir -p "$PROJECT_ROOT/config/{db.js,env/.dev,env/.prod}"

# Create src subdirectories
mkdir -p "$PROJECT_ROOT/src/{controllers,models,routes,services,utils,middleware,index.js}"

# Create tests subdirectories
mkdir -p "$PROJECT_ROOT/tests/{controllers,services,utils}"

# Create sample files
touch "$PROJECT_ROOT/README.md"
touch "$PROJECT_ROOT/.gitignore"
mkdir -p "$PROJECT_ROOT/config"
touch "$PROJECT_ROOT/config/db.js"
mkdir -p "$PROJECT_ROOT/config/env"
touch "$PROJECT_ROOT/config/env/.dev"
touch "$PROJECT_ROOT/config/env/.prod"
mkdir -p "$PROJECT_ROOT/src/controllers"
touch "$PROJECT_ROOT/src/controllers/authController.js"
touch "$PROJECT_ROOT/src/controllers/clientController.js"
touch "$PROJECT_ROOT/src/controllers/sanctionsController.js"
mkdir -p "$PROJECT_ROOT/src/models"
touch "$PROJECT_ROOT/src/models/Client.js"
touch "$PROJECT_ROOT/src/models/Transaction.js"
touch "$PROJECT_ROOT/src/models/User.js"
mkdir -p "$PROJECT_ROOT/src/routes"
touch "$PROJECT_ROOT/src/routes/authRoutes.js"
touch "$PROJECT_ROOT/src/routes/clientRoutes.js"
touch "$PROJECT_ROOT/src/routes/sanctionsRoutes.js"
mkdir -p "$PROJECT_ROOT/src/services"
touch "$PROJECT_ROOT/src/services/authService.js"
touch "$PROJECT_ROOT/src/services/clientService.js"
touch "$PROJECT_ROOT/src/services/sanctionsService.js"
mkdir -p "$PROJECT_ROOT/src/utils"
touch "$PROJECT_ROOT/src/utils/errorHandler.js"
touch "$PROJECT_ROOT/src/utils/logger.js"
mkdir -p "$PROJECT_ROOT/src/middleware"
touch "$PROJECT_ROOT/src/middleware/authMiddleware.js"
touch "$PROJECT_ROOT/src/middleware/errorMiddleware.js"
touch "$PROJECT_ROOT/src/index.js"

echo "Project folder structure created successfully!"
