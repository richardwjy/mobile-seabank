class OpnameResult {
    constructor(id, jumlahData, status, errMsg) {
        this.id = id;
        this.jumlahData = jumlahData;
        this.status = status; // L = Loading, S = Success, E = Error
        this.errMsg = errMsg
    }
}
export default OpnameResult;