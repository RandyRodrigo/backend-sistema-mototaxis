import app, { startMailServer, startServer } from './app';

const PORT = 3000;

const main = async () => {
    await startServer();
    await startMailServer();
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
};

main();
