const createConnection = require("./dbhandler");
const cron = require('node-cron');

const addSchedule = async (request, h) => {
    try {
        const { title, hour } = request.payload;
        const db = await createConnection();

        await db.execute(`
            CREATE TABLE IF NOT EXISTS schedule (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                hour VARCHAR(5) NOT NULL,
                isActive BOOLEAN DEFAULT true
            )
        `);

        const [result] = await db.execute("INSERT INTO schedule (title, hour) VALUES (?, ?)", [title, hour]);

        const insertedId = result.insertId;

        // Schedule the job using node-cron
        cron.schedule(`0 ${hour} * * *`, () => {
            // Only perform the action if the schedule is active
            if (isActive) {
                console.log(`Melakukan tindakan: ${title}`);
                // Implementasikan logika atau panggil fungsi untuk mengirim aksi ke NodeMCU di sini
            }
        });

        return h.response({
            status: "Success",
            message: "Jadwal berhasil disimpan dan dijadwalkan",
            code: 201,
            data: { id: insertedId, title, hour, isActive: true }
        });
    } catch (error) {
        console.error('Error during scheduling job:', error);
        return h.response({
            status: "Failed",
            message: "Terjadi kesalahan internal saat menjadwalkan job.",
            code: 500,
        });
    }
};

const toggleSchedule = async (request, h) => {
    try {
        const { scheduleId, isActive } = request.payload;
        const db = await createConnection();

        await db.execute("UPDATE schedule SET isActive = ? WHERE id = ?", [isActive, scheduleId]);

        return h.response({
            status: "Success",
            message: `Jadwal dengan ID ${scheduleId} berhasil diubah menjadi ${isActive ? 'aktif' : 'non-aktif'}.`,
            code: 200,
        });
    } catch (error) {
        console.error('Error during toggling schedule:', error);
        return h.response({
            status: "Failed",
            message: "Terjadi kesalahan internal saat mengubah status jadwal.",
            code: 500,
        });
    }
};


const getAllSchedules = async (request, h) => {
    try {
        const db = await createConnection();

        const [rows] = await db.execute("SELECT id, title, hour FROM schedule");

        const data = rows.map(({ id, title, hour }) => ({ id, title, hour }));

        return h.response({
            data: data,
        });
    } catch (error) {
        console.error('Error during fetching schedules:', error);
        return h.response({
            status: "Failed",
            message: "Terjadi kesalahan internal saat mengambil data jadwal.",
            code: 500,
        });
    }
};

const getNearestSchedule = async (request, h) => {
    try {
        const { userTime } = request.payload; // Ambil waktu dari perangkat pengguna

        const db = await createConnection();

        // Retrieve the nearest schedule from the database
        const [row] = await db.execute(`
            SELECT id, title, hour 
            FROM schedule 
            ORDER BY ABS(TIME_TO_SEC(TIMEDIFF(STR_TO_DATE(CONCAT(CURDATE(), ' ', ?), '%Y-%m-%d %H:%i'), STR_TO_DATE(CONCAT(CURDATE(), ' ', hour), '%Y-%m-%d %H:%i')))) 
            LIMIT 1
        `, [userTime]);

        const data = row[0];

        return h.response({
            data: data,
        });
    } catch (error) {
        console.error('Error during fetching nearest schedule:', error);
        return h.response({
            status: "Failed",
            message: "Terjadi kesalahan internal saat mengambil data jadwal terdekat.",
            code: 500,
        });
    }
};

module.exports = {
    addSchedule,
    getAllSchedules,
    getNearestSchedule,
    toggleSchedule
};
