const users = ["Catherine", "Gordon", "Jonathan"]

const bookmarks = [
    {
        id: "bookmark0",
        name: "facebook",
        url: "https://www.facebook.com",
        groups: ["group0", "group1"]
    },
    {
        id: "bookmark1",
        name: "youtube",
        url: "https://www.youtube.com",
        groups: ["group0"]
    },
    {
        id: "bookmark2",
        name: "matrix calculator",
        url: "https://matrixcalc.org/en/",
        groups: ["group2", "group4"]
    },
    {
        id: "bookmark3",
        name: "NTU mail",
        url: "https://ntumail.cc.ntu.edu.tw",
        groups: ["group3"]
    },
    {
        id: "bookmark4",
        name: "Quick Math",
        url: "https://quickmath.com",
        groups: ["group2", "group4"]
    },
    {
        id: "bookmark5",
        name: "typing speed test",
        url: "https://www.keybr.com",
        groups: ["group5"]
    },
    {
        id: "bookmark6",
        name: "10 fast finger",
        url: "https://10fastfingers.com",
        groups: ["group5"]
    },
    {
        id: "bookmark7",
        name: "chinese typing",
        url: "https://typing.tw",
        groups: ["group5"]
    }
]

const groups = [
    {
        id: "group0",
        groupname: "social media",
        privacy: "false",
        users: [users[0]],
        bookmarks: [ bookmarks[0], bookmarks[1]]
    }, {
        id: "group1",
        groupname: "friends",
        privacy: "false",
        users: [users[0]],
        bookmarks: [ bookmarks[0]]
    }, {
        id: "group2",
        groupname: "math",
        privacy: "false",
        users: [users[0]],
        bookmarks:[bookmarks[2], bookmarks[4]]
    }, {
        id: "group3",
        groupname: "ntu",
        privacy: "false",
        users: [users[0]],
        bookmarks:[bookmarks[3]]
    }, {
        id: "group4",
        groupname: "study",
        privacy: "false",
        users: [users[0]],
        bookmarks:[bookmarks[2], bookmarks[4]]
    }, {
        id: "group5",
        groupname: "typing",
        privacy: "true",
        users: [users[0]],
        bookmarks: [bookmarks[5], bookmarks[6], bookmarks[7]]
    }
]

const groupid_name = {
    group0: "social media",
    group1: "friends",
    group2: "math",
    group3: "ntu",
    group4: "study",
    group5: "typing" 
}

const db = {
    users,
    groups,
    bookmarks,
    groupid_name
}

export { db as default };