module.exports = {
    getFileType(path) {
        const ext = path.split(".").pop();
        const suffix = ext.split('?').shift();
        return suffix.toLowerCase();
    }
}