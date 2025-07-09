#!/usr/bin/env python3
"""
Script para executar a aplicação Flask do Dashboard de Leads
"""

from app import app

if __name__ == '__main__':
    print("🚀 Iniciando Dashboard de Leads...")
    print("📊 Dashboard: http://localhost:5000")
    print("📝 Cadastro: http://localhost:5000/cadastro")
    print("🔄 Para parar: Ctrl+C")
    print("-" * 50)
    
    app.run(debug=True, host='0.0.0.0', port=5000) 