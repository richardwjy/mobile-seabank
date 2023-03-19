import React from 'react';
import SQLite from 'react-native-sqlite-storage';

const DB_NAME = 'seabankopname.db'
const DB_VER = '1.0'
const DB_DISPLAY = 'SQLite Seabank Opname'
const DB_SIZE = 200000

export const conn = SQLite.openDatabase(DB_NAME, DB_VER, DB_DISPLAY, DB_SIZE)

export const init = () => {
    const p1 = new Promise((resolve, reject) => {
        conn.transaction((tx) => {
            tx.executeSql(
                `CREATE TABLE IF NOT EXISTS conf_login(
                    conf_login_id INTEGER PRIMARY KEY, 
                    user_id INTEGER, 
                    username TEXT, 
                    password TEXT, 
                    login_date TEXT, 
                    end_date TEXT, 
                    transaction_id INTEGER, 
                    trx_count_line INTEGER, 
                    cancel_opname_flag TEXT
                );`,
                [],
                (_, results) => {
                    resolve(results)
                },
                (_, err) => {
                    reject(err)
                }
            )
        })
    })
    const p2 = new Promise((resolve, reject) => {
        conn.transaction((tx) => {
            tx.executeSql(
                `CREATE TABLE IF NOT EXISTS trx_opname
                    (
                        transaction_line_id INTEGER PRIMARY KEY,
                        condition TEXT,
                        location_qr TEXT,
                        location_desc TEXT,
                        asset_number TEXT,
                        asset_desc TEXT,
                        scan_qr_date TEXT,
                        cycle_id INTEGER,
                        cycle_opname_date TEXT,
                        transaction_id INTEGER,
                        sent_flag TEXT, 
                        batch_id INTEGER);`,
                [],
                (_, results) => {
                    resolve(results)
                },
                (_, err) => {
                    reject(err)
                }
            )
        })
    })

    const p3 = new Promise((resolve, reject) => {
        conn.transaction((tx) => {
            tx.executeSql(
                `CREATE TABLE IF NOT EXISTS api_list_opname(
                    api_id INTEGER PRIMARY KEY,
                    api_name TEXT,
                    api_url TEXT);`,
                [],
                (_, results) => {
                    resolve(results)
                },
                (_, err) => {
                    reject(err)
                }
            )
        })
    })

    return Promise.all([p1, p2, p3]);
}

export const execSql = (query, params = []) => {
    const p = new Promise((resolve, reject) => {
        conn.transaction((tx) => {
            tx.executeSql(
                query,
                params,
                (_, results) => {
                    resolve(results);
                },
                (_, err) => {
                    reject(err);
                }
            )
        })
    })
    return p;
}

export const getApi = (param) => {
    const p = new Promise((resolve, reject) => {
        conn.transaction((tx) => {
            tx.executeSql(
                'SELECT api_url FROM api_list_opname WHERE api_name=?',
                [param],
                (_, results) => {
                    resolve(results);
                },
                (_, err) => {
                    reject(err);
                }
            )
        })
    })
    return p;
}