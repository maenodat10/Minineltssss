"use strict";

/* =========================================================
   MiniMelts
   Main JavaScript
========================================================= */

const DB_KEY =
    "minimelts_database_final_v3";

const DEFAULT_PASSWORD =
    "1234";


/* =========================================================
   SETTINGS
========================================================= */

const BRANCHES = [
    "Dunes",
    "Kidoz",
    "Sweifieh Village",
    "Aqaba",
    "Events"
];


const ROLE_NAMES = {

    employee: "موظف",

    supervisor: "سوبرفايزر",

    manager: "مدير",

    accountant: "محاسب",

    owner: "مالك"

};


/* =========================================================
   USERS
========================================================= */

const USERS = [

    {
        id: "u1",
        number: "1001",
        name: "Maan",
        role: "employee"
    },

    {
        id: "u2",
        number: "1002",
        name: "Hussam",
        role: "employee"
    },

    {
        id: "u3",
        number: "1003",
        name: "Layan Mahadin",
        role: "employee"
    },

    {
        id: "u4",
        number: "1004",
        name: "Layan Owaisi",
        role: "employee"
    },

    {
        id: "u5",
        number: "1005",
        name: "Sadeen",
        role: "employee"
    },

    {
        id: "u6",
        number: "1006",
        name: "Raghad",
        role: "employee"
    },

    {
        id: "u7",
        number: "1007",
        name: "Ibrahim",
        role: "employee"
    },

    {
        id: "u8",
        number: "1008",
        name: "Abdullah",
        role: "employee"
    },

    {
        id: "u9",
        number: "2001",
        name: "Fawaz",
        role: "supervisor"
    },

    {
        id: "u10",
        number: "2002",
        name: "Omar",
        role: "supervisor"
    },

    {
        id: "u11",
        number: "2003",
        name: "Dareen",
        role: "supervisor"
    },

    {
        id: "u12",
        number: "3001",
        name: "Murad",
        role: "manager"
    },

    {
        id: "u13",
        number: "3002",
        name: "Yousuf",
        role: "accountant"
    },

    {
        id: "u14",
        number: "3003",
        name: "Qusay",
        role: "accountant"
    },

    {
        id: "u15",
        number: "4001",
        name: "Raad",
        role: "owner"
    },

    {
        id: "u16",
        number: "5001",
        name: "Sultan",
        role: "owner"
    },

    {
        id: "u17",
        number: "5002",
        name: "Muhannad",
        role: "owner"
    }

];


let db = null;

let currentUser = null;


/* =========================================================
   HELPERS
========================================================= */

function $(id) {

    return document.getElementById(id);

}


function uid() {

    if (
        window.crypto &&
        crypto.randomUUID
    ) {

        return crypto.randomUUID();

    }

    return (
        Date.now() +
        Math.random()
            .toString(16)
            .slice(2)
    );

}


function getUserById(id) {

    return USERS.find(
        user => user.id === id
    );

}


/* =========================================================
   DATABASE
========================================================= */

function createDatabase() {

    return {

        attendance: [],

        leaves: [],

        complaints: [],

        inventory: [],

        leaveBalances: {}

    };

}


function getDatabase() {

    try {

        const saved =
            localStorage.getItem(DB_KEY);

        if (saved) {

            db = JSON.parse(saved);

        } else {

            db =
                createDatabase();

            saveDatabase();

        }

    } catch (error) {

        console.error(
            "Database error:",
            error
        );

        db =
            createDatabase();

        saveDatabase();

    }


    if (
        !Array.isArray(
            db.attendance
        )
    ) {

        db.attendance = [];

    }


    if (
        !Array.isArray(
            db.leaves
        )
    ) {

        db.leaves = [];

    }


    if (
        !Array.isArray(
            db.complaints
        )
    ) {

        db.complaints = [];

    }


    if (
        !Array.isArray(
            db.inventory
        )
    ) {

        db.inventory = [];

    }


    if (!db.leaveBalances) {

        db.leaveBalances = {};

    }


    ensureLeaveBalances();

    return db;

}


function saveDatabase() {

    try {

        localStorage.setItem(
            DB_KEY,
            JSON.stringify(db)
        );

    } catch (error) {

        console.error(
            "Database save error:",
            error
        );

    }

}


/* =========================================================
   LEAVE BALANCES
========================================================= */

function ensureLeaveBalances() {

    if (!db.leaveBalances) {

        db.leaveBalances = {};

    }


    USERS.forEach(user => {

        if (
            !db.leaveBalances[
                user.id
            ]
        ) {

            db.leaveBalances[
                user.id
            ] = {

                sick: 14,

                annual: 14

            };

        }

    });

}


function getLeaveBalance(userId) {

    ensureLeaveBalances();

    return (
        db.leaveBalances[
            userId
        ] || {

            sick: 14,

            annual: 14

        }
    );

}


/* =========================================================
   DATE / TIME
========================================================= */

function getToday() {

    const d =
        new Date();

    return [

        d.getFullYear(),

        String(
            d.getMonth() + 1
        ).padStart(2, "0"),

        String(
            d.getDate()
        ).padStart(2, "0")

    ].join("-");

}


function getCurrentTime() {

    const d =
        new Date();

    return [

        String(
            d.getHours()
        ).padStart(2, "0"),

        String(
            d.getMinutes()
        ).padStart(2, "0"),

        String(
            d.getSeconds()
        ).padStart(2, "0")

    ].join(":");

}


function formatDate(date) {

    if (!date) {

        return "-";

    }


    const parts =
        date.split("-");


    if (
        parts.length !== 3
    ) {

        return date;

    }


    return (
        `${parts[2]}/${parts[1]}/${parts[0]}`
    );

}


function getMonthKey(date) {

    return date
        ? date.substring(0, 7)
        : "";

}


function timeToMinutes(time) {

    if (!time) {

        return 0;

    }


    const parts =
        time
            .substring(0, 5)
            .split(":");


    return (
        Number(parts[0]) * 60 +
        Number(parts[1])
    );

}


function getMinutesDifference(
    start,
    end
) {

    if (!start || !end) {

        return 0;

    }


    let result =
        timeToMinutes(end) -
        timeToMinutes(start);


    if (result < 0) {

        result += 1440;

    }


    return result;

}


function formatDuration(
    minutes
) {

    if (
        !minutes ||
        minutes <= 0
    ) {

        return "0 ساعة";

    }


    const hours =
        Math.floor(
            minutes / 60
        );


    const mins =
        minutes % 60;


    if (mins === 0) {

        return `${hours} ساعة`;

    }


    return (
        `${hours} ساعة و ${mins} دقيقة`
    );

}


/* =========================================================
   PERMISSIONS
========================================================= */

function canRecordAttendance() {

    if (!currentUser) {

        return false;

    }


    return (

        currentUser.role ===
            "employee" ||

        currentUser.role ===
            "supervisor"

    );

}


function canSubmitRequests() {

    if (!currentUser) {

        return false;

    }


    return (

        currentUser.role ===
            "employee" ||

        currentUser.role ===
            "supervisor"

    );

}


function canManageLeaves() {

    if (!currentUser) {

        return false;

    }


    return (
        currentUser.id === "u12"
    );

}


function canReplyComplaints() {

    if (!currentUser) {

        return false;

    }


    return (
        currentUser.id === "u12"
    );

}


function canViewReports() {

    if (!currentUser) {

        return false;

    }


    return (

        currentUser.role ===
            "manager" ||

        currentUser.role ===
            "accountant" ||

        currentUser.role ===
            "owner"

    );

}


function canViewAttendanceDetails() {

    if (!currentUser) {

        return false;

    }


    return (

        currentUser.role ===
            "supervisor" ||

        currentUser.role ===
            "manager" ||

        currentUser.role ===
            "accountant" ||

        currentUser.role ===
            "owner"

    );

}


function canViewAllComplaints() {

    if (!currentUser) {

        return false;

    }


    return (

        currentUser.role ===
            "manager" ||

        currentUser.role ===
            "accountant" ||

        currentUser.role ===
            "owner"

    );

}


/* =========================================================
   LOGIN
========================================================= */

function setupLogin() {

    const form =
        $("loginForm");


    if (!form) {

        return;

    }


    form.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const number =
                $("loginNumber")
                    ?.value
                    .trim();


            const password =
                $("loginPassword")
                    ?.value;


            const user =
                USERS.find(
                    item =>
                        item.number ===
                        number
                );


            if (
                !user ||
                password !==
                    DEFAULT_PASSWORD
            ) {

                showToast(
                    "الرمز الوظيفي أو كلمة المرور غير صحيحة",
                    "error"
                );

                return;

            }


            currentUser =
                user;


            $("loginScreen")
                ?.classList
                .add("hidden");


            $("app")
                ?.classList
                .remove("hidden");


            renderApplication();


            showToast(
                `أهلاً ${user.name}`,
                "success"
            );

        }
    );

}


/* =========================================================
   PASSWORD
========================================================= */

function setupPasswordToggle() {

    const button =
        $("togglePassword");


    const input =
        $("loginPassword");


    if (
        !button ||
        !input
    ) {

        return;

    }


    button.addEventListener(
        "click",
        function() {

            input.type =
                input.type ===
                    "password"
                    ? "text"
                    : "password";


            const icon =
                button.querySelector(
                    "i"
                );


            if (icon) {

                icon.className =
                    input.type ===
                        "password"
                        ? "fa-solid fa-eye"
                        : "fa-solid fa-eye-slash";

            }

        }
    );

}


/* =========================================================
   LOGOUT
========================================================= */

function setupLogout() {

    $("logoutBtn")
        ?.addEventListener(
            "click",
            function() {

                currentUser =
                    null;


                $("app")
                    ?.classList
                    .add("hidden");


                $("loginScreen")
                    ?.classList
                    .remove("hidden");


                $("loginForm")
                    ?.reset();


                $("loginNumber")
                    ?.focus();

            }
        );

}


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

    document
        .querySelectorAll(
            "[data-page]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();

                    openPage(
                        button.dataset.page
                    );

                }
            );

        });

}


function openPage(page) {

    if (!currentUser) {

        return;

    }


    document
        .querySelectorAll(
            ".page"
        )
        .forEach(section => {

            section.classList
                .add("hidden");

        });


    const target =
        $(`page-${page}`);


    if (target) {

        target.classList
            .remove("hidden");

    }


    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(item => {

            item.classList
                .remove(
                    "active-page"
                );


            if (
                item.dataset.page ===
                page
            ) {

                item.classList
                    .add(
                        "active-page"
                    );

            }

        });


    const titles = {

        home: "الرئيسية",

        attendance:
            "الحضور والانصراف",

        leave:
            "الإجازات",

        reports:
            "التقارير والجرد",

        complaints:
            "الشكاوى والمقترحات"

    };


    if ($("pageTitle")) {

        $("pageTitle")
            .textContent =
            titles[page] || "";

    }


    switch (page) {

        case "home":

            renderHome();

            break;


        case "attendance":

            renderAttendance();

            break;


        case "leave":

            renderLeaves();

            break;


        case "reports":

            renderReports();

            break;


        case "complaints":

            renderComplaints();

            break;

    }

}


/* =========================================================
   APPLICATION
========================================================= */

function renderApplication() {

    if (!currentUser) {

        return;

    }


    if ($("sidebarUserName")) {

        $("sidebarUserName")
            .textContent =
            currentUser.name;

    }


    if ($("sidebarUserRole")) {

        $("sidebarUserRole")
            .textContent =
            ROLE_NAMES[
                currentUser.role
            ];

    }


    if ($("topUserName")) {

        $("topUserName")
            .textContent =
            currentUser.name;

    }


    if ($("reportsNav")) {

        $("reportsNav")
            .classList
            .toggle(
                "hidden",
                !canViewReports()
            );

    }


    const canRecord =
        canRecordAttendance();


    if ($("attendanceControls")) {

        $("attendanceControls")
            .classList
            .toggle(
                "hidden",
                !canRecord
            );

    }


    if ($("attendanceBranchCard")) {

        $("attendanceBranchCard")
            .classList
            .toggle(
                "hidden",
                !canRecord
            );

    }


    renderHome();

    renderAttendance();

    renderLeaves();

    renderComplaints();


    if (canViewReports()) {

        renderReports();

    }


    openPage("home");

}


/* =========================================================
   HOME
========================================================= */

function renderHome() {

    if (!currentUser) {

        return;

    }


    if ($("welcomeName")) {

        $("welcomeName")
            .textContent =
            currentUser.name;

    }


    const today =
        getToday();


    const record =
        db.attendance.find(
            item =>

                item.userId ===
                    currentUser.id &&

                item.date ===
                    today
        );


    let todayMinutes = 0;


    if (
        record &&
        record.checkIn &&
        record.checkOut
    ) {

        todayMinutes =
            getMinutesDifference(
                record.checkIn,
                record.checkOut
            );

    }


    if ($("homeTodayHours")) {

        $("homeTodayHours")
            .textContent =
            formatDuration(
                todayMinutes
            );

    }


    const month =
        getMonthKey(today);


    const monthRecords =
        db.attendance.filter(
            item =>

                item.userId ===
                    currentUser.id &&

                item.date.startsWith(
                    month
                ) &&

                item.checkIn &&

                item.checkOut
        );


    if ($("homeMonthDays")) {

        $("homeMonthDays")
            .textContent =
            monthRecords.length;

    }


    const balance =
        getLeaveBalance(
            currentUser.id
        );


    if ($("homeAnnualLeave")) {

        $("homeAnnualLeave")
            .textContent =
            balance.annual;

    }


    if ($("homeSickLeave")) {

        $("homeSickLeave")
            .textContent =
            balance.sick;

    }


    let status =
        "لم يتم تسجيل الحضور اليوم.";


    if (record) {

        status =
            `دخلت الساعة ${record.checkIn}`;


        if (record.checkOut) {

            status +=
                ` — خرجت الساعة ${record.checkOut}`;

        } else {

            status +=
                " — لم يتم تسجيل الانصراف بعد.";

        }

    }


    if ($("homeAttendanceStatus")) {

        $("homeAttendanceStatus")
            .textContent =
            status;

    }

}


/* =========================================================
   ATTENDANCE
========================================================= */

function renderAttendance() {

    if (!currentUser) {

        return;

    }


    const canRecord =
        canRecordAttendance();


    if ($("attendanceControls")) {

        $("attendanceControls")
            .classList
            .toggle(
                "hidden",
                !canRecord
            );

    }


    const today =
        getToday();


    const ownRecord =
        db.attendance.find(
            record =>

                record.userId ===
                    currentUser.id &&

                record.date ===
                    today
        );


    const branch =
        $("attendanceBranch");


    const checkInButton =
        $("checkInBtn");


    const checkOutButton =
        $("checkOutBtn");


    if (canRecord) {

        fillBranches();


        if (ownRecord) {

            if (branch) {

                branch.value =
                    ownRecord.branch ||
                    "";

                branch.disabled =
                    true;

            }


            if (checkInButton) {

                checkInButton.disabled =
                    true;

            }


            if (checkOutButton) {

                checkOutButton.disabled =
                    Boolean(
                        ownRecord.checkOut
                    );

            }

        } else {

            if (branch) {

                branch.disabled =
                    false;

            }


            if (checkInButton) {

                checkInButton.disabled =
                    false;

            }


            if (checkOutButton) {

                checkOutButton.disabled =
                    true;

            }

        }

    }


    renderOwnAttendanceSummary();

    renderAttendanceTable();


    const detailsSection =
        $("supervisorAttendanceSection");


    const canSeeDetails =
        canViewAttendanceDetails();


    if (detailsSection) {

        detailsSection.classList
            .toggle(
                "hidden",
                !canSeeDetails
            );

    }


    if (canSeeDetails) {

        renderSupervisorAttendance();

    }

}


/* =========================================================
   BRANCHES
========================================================= */

function fillBranches() {

    const select =
        $("attendanceBranch");


    if (!select) {

        return;

    }


    const current =
        select.value;


    select.innerHTML = `

        <option value="">
            اختر الفرع
        </option>

        ${BRANCHES.map(
            branch => `
                <option value="${branch}">
                    ${branch}
                </option>
            `
        ).join("")}

    `;


    if (current) {

        select.value =
            current;

    }

}


/* =========================================================
   CHECK IN
========================================================= */

function checkIn() {

    if (!currentUser) {

        return;

    }


    if (!canRecordAttendance()) {

        showToast(
            "لا تملك صلاحية تسجيل الحضور",
            "error"
        );

        return;

    }


    const today =
        getToday();


    const exists =
        db.attendance.find(
            record =>

                record.userId ===
                    currentUser.id &&

                record.date ===
                    today
        );


    if (exists) {

        showToast(
            "تم تسجيل حضورك لهذا اليوم مسبقاً",
            "error"
        );

        return;

    }


    const branch =
        $("attendanceBranch")
            ?.value;


    if (!branch) {

        showToast(
            "اختر الفرع أولاً",
            "error"
        );

        return;

    }


    db.attendance.push({

        id: uid(),

        userId:
            currentUser.id,

        date:
            today,

        branch:
            branch,

        checkIn:
            getCurrentTime(),

        checkOut:
            null

    });


    saveDatabase();


    renderAttendance();

    renderHome();


    showToast(
        "تم تسجيل الحضور بنجاح",
        "success"
    );

}


/* =========================================================
   CHECK OUT
========================================================= */

function checkOut() {

    if (!currentUser) {

        return;

    }


    if (!canRecordAttendance()) {

        showToast(
            "لا تملك صلاحية تسجيل الانصراف",
            "error"
        );

        return;

    }


    const today =
        getToday();


    const record =
        db.attendance.find(
            item =>

                item.userId ===
                    currentUser.id &&

                item.date ===
                    today
        );


    if (!record) {

        showToast(
            "يجب تسجيل الحضور أولاً",
            "error"
        );

        return;

    }


    if (record.checkOut) {

        showToast(
            "تم تسجيل الانصراف مسبقاً",
            "error"
        );

        return;

    }


    record.checkOut =
        getCurrentTime();


    saveDatabase();


    renderAttendance();

    renderHome();


    showToast(
        "تم تسجيل الانصراف بنجاح",
        "success"
    );

}


/* =========================================================
   OWN ATTENDANCE
========================================================= */

function renderOwnAttendanceSummary() {

    const container =
        $("ownAttendanceSummary");


    if (
        !container ||
        !currentUser
    ) {

        return;

    }


    const today =
        getToday();


    const record =
        db.attendance.find(
            item =>

                item.userId ===
                    currentUser.id &&

                item.date ===
                    today
        );


    let minutes = 0;


    if (
        record?.checkIn &&
        record?.checkOut
    ) {

        minutes =
            getMinutesDifference(
                record.checkIn,
                record.checkOut
            );

    }


    container.innerHTML = `

        <div class="stat-card">

            <div class="stat-icon blue">
                <i class="fa-solid fa-right-to-bracket"></i>
            </div>

            <div>

                <span>
                    دخول اليوم
                </span>

                <strong dir="ltr">
                    ${record?.checkIn || "-"}
                </strong>

            </div>

        </div>


        <div class="stat-card">

            <div class="stat-icon red">
                <i class="fa-solid fa-right-from-bracket"></i>
            </div>

            <div>

                <span>
                    خروج اليوم
                </span>

                <strong dir="ltr">
                    ${record?.checkOut || "-"}
                </strong>

            </div>

        </div>


        <div class="stat-card">

            <div class="stat-icon green">
                <i class="fa-solid fa-clock"></i>
            </div>

            <div>

                <span>
                    ساعات اليوم
                </span>

                <strong>
                    ${formatDuration(minutes)}
                </strong>

            </div>

        </div>

    `;

}


/* =========================================================
   ATTENDANCE TABLE
========================================================= */

function renderAttendanceTable() {

    const body =
        $("attendanceTableBody");


    if (
        !body ||
        !currentUser
    ) {

        return;

    }


    let records;


    if (
        currentUser.role ===
        "employee"
    ) {

        records =
            db.attendance.filter(
                item =>
                    item.userId ===
                    currentUser.id
            );

    } else {

        records =
            db.attendance;

    }


    records =
        [...records].sort(
            (a, b) =>
                b.date.localeCompare(
                    a.date
                )
        );


    if (!records.length) {

        body.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    style="text-align:center;"
                >
                    لا توجد سجلات حضور
                </td>

            </tr>

        `;

        return;

    }


    body.innerHTML =
        records.map(
            record => {

                const user =
                    getUserById(
                        record.userId
                    );


                const minutes =
                    record.checkIn &&
                    record.checkOut

                        ? getMinutesDifference(
                            record.checkIn,
                            record.checkOut
                        )

                        : 0;


                return `

                    <tr>

                        <td>
                            ${user?.name || "غير معروف"}
                        </td>

                        <td>
                            ${
                                user
                                    ? ROLE_NAMES[
                                        user.role
                                    ]
                                    : "-"
                            }
                        </td>

                        <td>
                            ${formatDate(
                                record.date
                            )}
                        </td>

                        <td>
                            ${record.branch || "-"}
                        </td>

                        <td dir="ltr">
                            ${record.checkIn || "-"}
                        </td>

                        <td dir="ltr">
                            ${record.checkOut || "-"}
                        </td>

                        <td>
                            ${formatDuration(
                                minutes
                            )}
                        </td>

                    </tr>

                `;

            }
        ).join("");

}


/* =========================================================
   ALL ATTENDANCE DETAILS
========================================================= */

function renderSupervisorAttendance() {

    const body =
        $("supervisorAttendanceBody");


    if (!body) {

        return;

    }


    const today =
        getToday();


    const workers =
        USERS.filter(
            user =>

                user.role ===
                    "employee" ||

                user.role ===
                    "supervisor"
        );


    body.innerHTML =
        workers.map(
            user => {

                const record =
                    db.attendance.find(
                        item =>

                            item.userId ===
                                user.id &&

                            item.date ===
                                today
                    );


                if (!record) {

                    return `

                        <tr>

                            <td>
                                ${user.name}
                            </td>

                            <td>
                                ${ROLE_NAMES[
                                    user.role
                                ]}
                            </td>

                            <td>
                                -
                            </td>

                            <td>
                                لم يسجل
                            </td>

                            <td>
                                -
                            </td>

                            <td>
                                -
                            </td>

                        </tr>

                    `;

                }


                const minutes =
                    record.checkIn &&
                    record.checkOut

                        ? getMinutesDifference(
                            record.checkIn,
                            record.checkOut
                        )

                        : 0;


                return `

                    <tr>

                        <td>
                            ${user.name}
                        </td>

                        <td>
                            ${ROLE_NAMES[
                                user.role
                            ]}
                        </td>

                        <td>
                            ${record.branch || "-"}
                        </td>

                        <td dir="ltr">
                            ${record.checkIn || "-"}
                        </td>

                        <td dir="ltr">
                            ${record.checkOut || "-"}
                        </td>

                        <td>
                            ${
                                record.checkOut

                                    ? formatDuration(
                                        minutes
                                    )

                                    : "على رأس العمل"
                            }
                        </td>

                    </tr>

                `;

            }
        ).join("");

}


/* =========================================================
   LEAVES
========================================================= */

function renderLeaves() {

    if (!currentUser) {

        return;

    }


    const balance =
        getLeaveBalance(
            currentUser.id
        );


    if ($("sickRemaining")) {

        $("sickRemaining")
            .textContent =
            balance.sick;

    }


    if ($("annualRemaining")) {

        $("annualRemaining")
            .textContent =
            balance.annual;

    }


    const leaveForm =
        $("leaveForm");


    const canSubmit =
        canSubmitRequests();


    if (leaveForm) {

        leaveForm.classList
            .toggle(
                "hidden",
                !canSubmit
            );

    }


    let records;


    if (
        currentUser.role ===
            "employee" ||

        currentUser.role ===
            "supervisor"
    ) {

        records =
            db.leaves.filter(
                item =>
                    item.userId ===
                    currentUser.id
            );

    } else {

        records =
            db.leaves;

    }


    records =
        [...records].sort(
            (a, b) => {

                const dateA =
                    a.date ||
                    a.start ||
                    "";

                const dateB =
                    b.date ||
                    b.start ||
                    "";

                return (
                    dateB.localeCompare(
                        dateA
                    )
                );

            }
        );


    const body =
        $("leaveTableBody");


    if (!body) {

        return;

    }


    if (!records.length) {

        body.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    style="text-align:center;"
                >
                    لا توجد إجازات
                </td>

            </tr>

        `;

        return;

    }


    body.innerHTML =
        records.map(
            leave => {

                const user =
                    getUserById(
                        leave.userId
                    );


                const type =
                    leave.type ===
                        "sick"

                        ? "مرضية"

                        : "سنوية";


                let actions =
                    "-";


                if (
                    canManageLeaves() &&
                    leave.status ===
                        "قيد المراجعة"
                ) {

                    actions = `

                        <div class="action-buttons">

                            <button
                                class="btn success"
                                onclick="approveLeave('${leave.id}')"
                            >
                                <i class="fa-solid fa-check"></i>
                                موافقة
                            </button>

                            <button
                                class="btn danger"
                                onclick="rejectLeave('${leave.id}')"
                            >
                                <i class="fa-solid fa-xmark"></i>
                                رفض
                            </button>

                        </div>

                    `;

                }


                const leaveDate =
                    leave.date ||
                    leave.start ||
                    leave.end ||
                    "";


                return `

                    <tr>

                        <td>
                            ${user?.name || "غير معروف"}
                        </td>

                        <td>
                            ${type}
                        </td>

                        <td>
                            ${formatDate(
                                leaveDate
                            )}
                        </td>

                        <td>
                            1
                        </td>

                        <td>
                            ${leave.reason || "-"}
                        </td>

                        <td>
                            <span class="status-badge">
                                ${leave.status}
                            </span>
                        </td>

                        <td>
                            ${
                                leave.createdAt

                                    ? formatDate(
                                        leave.createdAt
                                            .substring(
                                                0,
                                                10
                                            )
                                    )

                                    : "-"
                            }
                        </td>

                        <td>
                            ${actions}
                        </td>

                    </tr>

                `;

            }
        ).join("");

}


/* =========================================================
   SUBMIT LEAVE
========================================================= */

function submitLeave(event) {

    event.preventDefault();


    if (!currentUser) {

        return;

    }


    if (!canSubmitRequests()) {

        showToast(
            "لا تملك صلاحية تقديم طلب إجازة",
            "error"
        );

        return;

    }


    const type =
        $("leaveType")
            ?.value;


    const date =
        $("leaveDate")
            ?.value;


    const reason =
        $("leaveReason")
            ?.value
            .trim();


    if (
        !type ||
        !date
    ) {

        showToast(
            "اختر نوع الإجازة والتاريخ أولاً",
            "error"
        );

        return;

    }


    const balance =
        getLeaveBalance(
            currentUser.id
        );


    const available =
        type === "sick"

            ? balance.sick

            : balance.annual;


    if (available < 1) {

        showToast(
            "لا يوجد رصيد كافٍ من هذا النوع من الإجازة",
            "error"
        );

        return;

    }


    db.leaves.push({

        id: uid(),

        userId:
            currentUser.id,

        type:
            type,

        date:
            date,

        days:
            1,

        reason:
            reason,

        status:
            "قيد المراجعة",

        createdAt:
            new Date()
                .toISOString()

    });


    saveDatabase();


    $("leaveForm")
        ?.reset();


    renderLeaves();


    showToast(
        "تم تقديم طلب الإجازة ليوم واحد",
        "success"
    );

}


/* =========================================================
   APPROVE LEAVE
========================================================= */

function approveLeave(id) {

    if (!canManageLeaves()) {

        showToast(
            "فقط المدير مراد يستطيع الموافقة على الإجازات",
            "error"
        );

        return;

    }


    const leave =
        db.leaves.find(
            item =>
                item.id === id
        );


    if (!leave) {

        return;

    }


    if (
        leave.status !==
        "قيد المراجعة"
    ) {

        return;

    }


    const balance =
        getLeaveBalance(
            leave.userId
        );


    const key =
        leave.type === "sick"

            ? "sick"

            : "annual";


    if (
        leave.days >
        balance[key]
    ) {

        showToast(
            "رصيد الإجازة غير كافٍ",
            "error"
        );

        return;

    }


    balance[key] -=
        leave.days;


    leave.status =
        "مقبولة";


    leave.approvedBy =
        currentUser.id;


    leave.approvedAt =
        new Date()
            .toISOString();


    saveDatabase();


    renderLeaves();


    showToast(
        "تمت الموافقة على الإجازة",
        "success"
    );

}


/* =========================================================
   REJECT LEAVE
========================================================= */

function rejectLeave(id) {

    if (!canManageLeaves()) {

        showToast(
            "فقط المدير مراد يستطيع رفض الإجازات",
            "error"
        );

        return;

    }


    const leave =
        db.leaves.find(
            item =>
                item.id === id
        );


    if (!leave) {

        return;

    }


    if (
        leave.status !==
        "قيد المراجعة"
    ) {

        return;

    }


    leave.status =
        "مرفوضة";


    leave.rejectedBy =
        currentUser.id;


    leave.rejectedAt =
        new Date()
            .toISOString();


    saveDatabase();


    renderLeaves();


    showToast(
        "تم رفض الإجازة",
        "success"
    );

}


/* =========================================================
   REPORTS
========================================================= */

function renderReports() {

    if (
        !currentUser ||
        !canViewReports()
    ) {

        return;

    }


    const container =
        $("reportsContent");


    if (!container) {

        return;

    }


    const workers =
        USERS.filter(
            user =>

                user.role ===
                    "employee" ||

                user.role ===
                    "supervisor"
        );


    const today =
        getToday();


    const month =
        getMonthKey(today);


    const year =
        today.substring(
            0,
            4
        );


    let companyMinutes =
        0;


    db.attendance.forEach(
        record => {

            if (
                record.checkIn &&
                record.checkOut
            ) {

                companyMinutes +=
                    getMinutesDifference(
                        record.checkIn,
                        record.checkOut
                    );

            }

        }
    );


    container.innerHTML = `

        <div class="content-card">

            <div class="section-title">

                <div>

                    <h3>
                        التقارير وجرد ساعات الدوام
                    </h3>

                    <p>
                        تفاصيل ساعات جميع الموظفين والسوبرفايزر.
                    </p>

                </div>

                <i class="fa-solid fa-chart-column section-title-icon"></i>

            </div>

        </div>


        <div class="card-grid">

            <div class="stat-card">

                <div class="stat-icon blue">
                    <i class="fa-solid fa-users"></i>
                </div>

                <div>

                    <span>
                        الموظفين والسوبرفايزر
                    </span>

                    <strong>
                        ${workers.length}
                    </strong>

                </div>

            </div>


            <div class="stat-card">

                <div class="stat-icon green">
                    <i class="fa-solid fa-clock"></i>
                </div>

                <div>

                    <span>
                        إجمالي ساعات الدوام
                    </span>

                    <strong>
                        ${formatDuration(
                            companyMinutes
                        )}
                    </strong>

                </div>

            </div>

        </div>


        <div class="table-card">

            <div class="section-title">

                <div>

                    <h3>
                        جرد ساعات الموظفين
                    </h3>

                    <p>
                        اليوم:
                        ${formatDate(today)}
                    </p>

                </div>

            </div>


            <div class="table-wrapper">

                <table>

                    <thead>

                        <tr>

                            <th>
                                الموظف
                            </th>

                            <th>
                                الوظيفة
                            </th>

                            <th>
                                دخول اليوم
                            </th>

                            <th>
                                خروج اليوم
                            </th>

                            <th>
                                ساعات اليوم
                            </th>

                            <th>
                                ساعات الشهر
                            </th>

                            <th>
                                ساعات السنة
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        ${workers.map(
                            user => {

                                const todayRecord =
                                    db.attendance.find(
                                        record =>

                                            record.userId ===
                                                user.id &&

                                            record.date ===
                                                today
                                    );


                                const monthRecords =
                                    db.attendance.filter(
                                        record =>

                                            record.userId ===
                                                user.id &&

                                            record.date.startsWith(
                                                month
                                            ) &&

                                            record.checkIn &&

                                            record.checkOut
                                    );


                                const yearRecords =
                                    db.attendance.filter(
                                        record =>

                                            record.userId ===
                                                user.id &&

                                            record.date.startsWith(
                                                year
                                            ) &&

                                            record.checkIn &&

                                            record.checkOut
                                    );


                                const todayMinutes =
                                    todayRecord?.checkIn &&
                                    todayRecord?.checkOut

                                        ? getMinutesDifference(
                                            todayRecord.checkIn,
                                            todayRecord.checkOut
                                        )

                                        : 0;


                                const monthMinutes =
                                    monthRecords.reduce(
                                        (
                                            total,
                                            record
                                        ) =>

                                            total +
                                            getMinutesDifference(
                                                record.checkIn,
                                                record.checkOut
                                            ),

                                        0
                                    );


                                const yearMinutes =
                                    yearRecords.reduce(
                                        (
                                            total,
                                            record
                                        ) =>

                                            total +
                                            getMinutesDifference(
                                                record.checkIn,
                                                record.checkOut
                                            ),

                                        0
                                    );


                                return `

                                    <tr>

                                        <td>
                                            ${user.name}
                                        </td>

                                        <td>
                                            ${ROLE_NAMES[
                                                user.role
                                            ]}
                                        </td>

                                        <td dir="ltr">
                                            ${
                                                todayRecord?.checkIn ||
                                                "-"
                                            }
                                        </td>

                                        <td dir="ltr">
                                            ${
                                                todayRecord?.checkOut ||
                                                "-"
                                            }
                                        </td>

                                        <td>
                                            ${formatDuration(
                                                todayMinutes
                                            )}
                                        </td>

                                        <td>
                                            ${formatDuration(
                                                monthMinutes
                                            )}
                                        </td>

                                        <td>
                                            ${formatDuration(
                                                yearMinutes
                                            )}
                                        </td>

                                    </tr>

                                `;

                            }
                        ).join("")}

                    </tbody>

                </table>

            </div>

        </div>

    `;

}


/* =========================================================
   COMPLAINTS
========================================================= */

function renderComplaints() {

    if (!currentUser) {

        return;

    }


    const body =
        $("complaintsTableBody");


    if (!body) {

        return;

    }


    const complaintForm =
        $("complaintForm");


    const canSubmit =
        canSubmitRequests();


    if (complaintForm) {

        complaintForm.classList
            .toggle(
                "hidden",
                !canSubmit
            );

    }


    let records;


    if (

        currentUser.role ===
            "employee" ||

        currentUser.role ===
            "supervisor"

    ) {

        records =
            db.complaints.filter(
                item =>
                    item.userId ===
                    currentUser.id
            );

    } else if (
        canViewAllComplaints()
    ) {

        records =
            db.complaints;

    } else {

        records = [];

    }


    records =
        [...records].sort(
            (a, b) =>

                (
                    b.createdAt ||
                    ""
                ).localeCompare(
                    a.createdAt ||
                    ""
                )
        );


    if (!records.length) {

        body.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    style="text-align:center;"
                >
                    لا توجد شكاوى أو مقترحات
                </td>

            </tr>

        `;

        return;

    }


    body.innerHTML =
        records.map(
            complaint => {

                const user =
                    getUserById(
                        complaint.userId
                    );


                return `

                    <tr>

                        <td>
                            ${user?.name || "غير معروف"}
                        </td>

                        <td>
                            ${escapeHtml(
                                complaint.text
                            )}
                        </td>

                        <td>
                            ${
                                complaint.reply

                                    ? escapeHtml(
                                        complaint.reply
                                    )

                                    : "لا يوجد رد"
                            }
                        </td>

                        <td>

                            ${
                                canReplyComplaints()

                                    ? `

                                        <button
                                            class="btn primary"
                                            onclick="replyComplaint('${complaint.id}')"
                                        >

                                            <i class="fa-solid fa-reply"></i>

                                            الرد

                                        </button>

                                    `

                                    : "-"

                            }

                        </td>

                    </tr>

                `;

            }
        ).join("");

}


/* =========================================================
   SUBMIT COMPLAINT
========================================================= */

function submitComplaint(event) {

    event.preventDefault();


    if (!currentUser) {

        return;

    }


    if (!canSubmitRequests()) {

        showToast(
            "لا تملك صلاحية تقديم شكوى أو مقترح",
            "error"
        );

        return;

    }


    const input =
        $("complaintText");


    const text =
        input?.value
            .trim();


    if (!text) {

        showToast(
            "اكتب الشكوى أو المقترح أولاً",
            "error"
        );

        return;

    }


    db.complaints.push({

        id: uid(),

        userId:
            currentUser.id,

        text:
            text,

        reply:
            "",

        createdAt:
            new Date()
                .toISOString()

    });


    saveDatabase();


    $("complaintForm")
        ?.reset();


    renderComplaints();


    showToast(
        "تم إرسال الشكوى",
        "success"
    );

}


/* =========================================================
   REPLY COMPLAINT
========================================================= */

function replyComplaint(id) {

    if (!canReplyComplaints()) {

        showToast(
            "فقط المدير مراد يستطيع الرد",
            "error"
        );

        return;

    }


    const complaint =
        db.complaints.find(
            item =>
                item.id === id
        );


    if (!complaint) {

        return;

    }


    const reply =
        prompt(
            "اكتب الرد:"
        );


    if (
        reply === null ||
        !reply.trim()
    ) {

        return;

    }


    complaint.reply =
        reply.trim();


    complaint.repliedBy =
        currentUser.id;


    complaint.repliedAt =
        new Date()
            .toISOString();


    saveDatabase();


    renderComplaints();


    showToast(
        "تم إرسال الرد",
        "success"
    );

}


/* =========================================================
   SECURITY DISPLAY
========================================================= */

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================================
   CLOCK
========================================================= */

function startClock() {

    function update() {

        const now =
            new Date();


        const time = [

            String(
                now.getHours()
            ).padStart(2, "0"),

            String(
                now.getMinutes()
            ).padStart(2, "0"),

            String(
                now.getSeconds()
            ).padStart(2, "0")

        ].join(":");


        if ($("liveClock")) {

            $("liveClock")
                .textContent =
                time;

        }


        if ($("liveClockAttendance")) {

            $("liveClockAttendance")
                .textContent =
                time;

        }


        if ($("todayText")) {

            $("todayText")
                .textContent =
                formatDate(
                    getToday()
                );

        }

    }


    update();


    setInterval(
        update,
        1000
    );

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    message,
    type = "success"
) {

    const toast =
        $("toast");


    if (!toast) {

        return;

    }


    toast.textContent =
        message;


    toast.className =
        "";


    toast.id =
        "toast";


    toast.classList.add(
        type
    );


    toast.classList.add(
        "show"
    );


    clearTimeout(
        showToast.timeout
    );


    showToast.timeout =
        setTimeout(
            () => {

                toast.classList
                    .remove(
                        "show"
                    );

            },
            3000
        );

}


/* =========================================================
   INIT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        getDatabase();

        setupLogin();

        setupPasswordToggle();

        setupLogout();

        setupNavigation();


        $("leaveForm")
            ?.addEventListener(
                "submit",
                submitLeave
            );


        $("complaintForm")
            ?.addEventListener(
                "submit",
                submitComplaint
            );


        $("loginScreen")
            ?.classList
            .remove("hidden");


        $("app")
            ?.classList
            .add("hidden");


        startClock();


        setTimeout(
            () => {

                $("loginNumber")
                    ?.focus();

            },
            150
        );

    }
);


/* =========================================================
   STORAGE SYNC
========================================================= */

window.addEventListener(
    "storage",
    function(event) {

        if (
            event.key !==
            DB_KEY
        ) {

            return;

        }


        getDatabase();


        if (currentUser) {

            renderApplication();

        }

    }
);