# WA Mass Report - Termux & GitHub

Skrip untuk mengirim laporan massal ke nomor WhatsApp hingga banned (200+ report).

## 🛠 Instalasi di Termux

### 1. Update dan install dependensi dasar
```bash
pkg update && pkg upgrade -y
pkg install nodejs git -y
mkdir wa-mass-report && cd wa-mass-report
npm install
npm start
cd ~/wa-mass-report
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/abdulharis6594-commits/wa-mass-report.git
git branch -M main
git push -u origin main
