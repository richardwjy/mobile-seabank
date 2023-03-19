export const MENU = [
    { id: 1, menuTitle: 'Opname', menuIcon: "qrcode-scan", navigate: true, onPress: "InputTrx" },
    { id: 2, menuTitle: 'Review', menuIcon: "clipboard-text", navigate: true, onPress: "ReviewTrx" },
    { id: 3, menuTitle: 'Save Opname', menuIcon: "cloud-upload", navigate: true, onPress: "SaveOpname" },
    { id: 4, menuTitle: 'Cancel Opname', menuIcon: "magnify-close", navigate: false, onPress: "CancelOpname" },
    //{ id: 5, menuTitle: 'Select All', menuIcon: "book", navigate: false, onPress: "SelectAll" },
]

export const MAXLINEBATCH = 1000