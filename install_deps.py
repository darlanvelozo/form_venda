#!/usr/bin/env python3
"""
Script para instalar dependências automaticamente
"""

import subprocess
import sys

def install_package(package):
    """Instala um pacote usando pip"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        print(f"✅ {package} instalado com sucesso!")
        return True
    except subprocess.CalledProcessError:
        print(f"❌ Erro ao instalar {package}")
        return False

def main():
    print("🔧 Instalando dependências do projeto...")
    print("-" * 50)
    
    packages = [
        "flask==2.3.3",
        "flask-cors==4.0.0", 
        "psycopg2-binary==2.9.7",
        "requests==2.31.0"
    ]
    
    success_count = 0
    
    for package in packages:
        if install_package(package):
            success_count += 1
    
    print("-" * 50)
    if success_count == len(packages):
        print("✅ Todas as dependências foram instaladas com sucesso!")
        print("🚀 Agora você pode executar: python run.py")
    else:
        print(f"⚠️  {success_count}/{len(packages)} dependências instaladas")
        print("💡 Tente executar manualmente: pip install -r requirements.txt")

if __name__ == "__main__":
    main() 