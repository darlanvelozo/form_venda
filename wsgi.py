#!/usr/bin/env python3
"""
WSGI entry point para produção com Gunicorn
"""

import os
import sys

# Adiciona o diretório da aplicação ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app

# Para logs em produção
import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5005)

# Variável que o Gunicorn irá usar
application = app 