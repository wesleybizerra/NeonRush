const { app, BrowserWindow, shell, protocol } = require('electron');
const path = require('path');
const { fork } = require('child_process');
const fs = require('fs');

let serverProcess;

// Configuração de Segurança Profissional
app.commandLine.appendSwitch('disable-site-isolation-trials');
app.commandLine.appendSwitch('disable-features', 'BlockInsecurePrivateNetworkRequests');

function startServer() {
  try {
    // Localiza o executor TSX dentro dos node_modules do jogo instalado
    const serverPath = path.resolve(__dirname, 'server.ts');
    const tsxPath = path.resolve(__dirname, 'node_modules', 'tsx', 'dist', 'cli.mjs');

    console.log('--- MOTOR DO SERVIDOR ---');
    console.log('Alvo:', serverPath);

    // Inicia o servidor como um processo filho "blindado"
    serverProcess = fork(serverPath, [], {
      execPath: process.execPath,
      execArgv: [tsxPath],
      env: { 
        ...process.env, 
        NODE_ENV: 'production', 
        PORT: '3000',
        ELECTRON_RUN_AS_NODE: '1',
        APP_URL: 'http://localhost:3000'
      },
      stdio: 'inherit'
    });

    serverProcess.on('error', (err) => {
      console.error('ERRO CRÍTICO NO MOTOR:', err);
    });

    serverProcess.on('exit', (code) => {
      if (code !== 0) {
        console.log('Servidor caiu. Reiniciando em 2s...');
        setTimeout(startServer, 2000);
      }
    });
  } catch (e) {
    console.error('FALHA NA IGNIÇÃO DO SERVIDOR:', e);
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    backgroundColor: '#000000',
    show: false,
    frame: true, // Estilo clássico profissional
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false, // LIBERA O CARREGAMENTO DE MODELOS 3D LOCAIS
      allowRunningInsecureContent: true
    }
  });

  win.maximize();
  
  // Abre links de pagamento no navegador real do usuário
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Carrega a interface do jogo
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  
  // Pequeno delay para garantir que o servidor subiu
  setTimeout(() => {
    win.loadFile(indexPath).then(() => {
      win.show();
      console.log('Interface carregada com sucesso.');
    }).catch(err => {
      console.error("Erro ao carregar interface:", err);
      // Se falhar o arquivo, tenta carregar via localhost como fallback
      win.loadURL('http://localhost:3000').catch(() => {
        console.error("Falha total no carregamento.");
      });
    });
  }, 1500);
}

app.whenReady().then(() => {
  startServer();
  createWindow();
});

app.on('window-all-closed', () => {
  if (serverProcess) serverProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});
