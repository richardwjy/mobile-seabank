class OpnameHdr {
    constructor(transaction_id, device_id, count_line, cycle_opname_date, cycle_id, opname_ln) {
        this.transaction_id = transaction_id;
        this.device_id = device_id;
        this.count_line = count_line;
        this.cycle_opname_date = cycle_opname_date;
        this.cycle_hdr_id = cycle_id;
        this.opname_ln = opname_ln;
    }
}

export default OpnameHdr;