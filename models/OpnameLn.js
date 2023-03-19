class OpnameLn {
    constructor(condition, location_scan, asset_number, scan_qr_date, transaction_line_id, user_login) {
        this.kondisi = condition;
        this.combination_location_id = location_scan;
        this.asset_number = asset_number;
        this.scan_qr_date = scan_qr_date;
        this.transaction_line_id = transaction_line_id;
        this.user_login = user_login
    }
}

export default OpnameLn;