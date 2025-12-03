
const BASE_URL = "http://gadimovsabir-001-site9.mtempurl.com/api/Students";

document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector("tbody")) getData();
    else if (document.getElementById("createProductForm")) handleAddForm();
    else if (document.getElementById("editProductForm")) handleEditForm();
});


function getData() {
    fetch(BASE_URL)
        .then(res => res.json())
        .then(students => {
            const tbody = document.querySelector("tbody");
            tbody.innerHTML = "";
            students.forEach(student => {
                tbody.appendChild(createStudentRow(student));
            });
        })
        .catch(err => showErrorModal("Error", "Failed to load students"));
}

function createStudentRow(student) {
    const tr = document.createElement("tr");

    const fields = ["id", "name", "surname", "fatherName", "profilePhoto", "age", "grade", "bio"];

    fields.forEach(field => {
        const td = document.createElement("td");

        if (field === "profilePhoto") {
            const img = document.createElement("img");
            img.src = student.profilePhoto || "https://via.placeholder.com/100";
            img.alt = "Profile";
            img.style.cssText = "width: 100px; height: 100px; border-radius: 8px; object-fit: cover;";
            td.appendChild(img);
        } else {
            td.textContent = student[field];
        }

        tr.appendChild(td);
    });

    const actionTd = document.createElement("td");
    const actionWrapper = document.createElement("div");
    actionWrapper.className = "action-buttons";

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "btn-edit";
    editBtn.onclick = () => window.location.href = `edit.html?id=${student.id}`;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "btn-delete";
    deleteBtn.onclick = () => confirmDelete(student.id);

    actionWrapper.appendChild(editBtn);
    actionWrapper.appendChild(deleteBtn);
    actionTd.appendChild(actionWrapper);
    tr.appendChild(actionTd);

    return tr;
}




function confirmDelete(id) {
    showModal("Delete Student", "Are you sure you want to delete this student?", () => {
        fetch(`${BASE_URL}/${id}`, { method: "DELETE" })
            .then(res => res.ok ? showSuccessModal("Success", "Student deleted!", getData) : Promise.reject("Delete failed"))
            .catch(err => showErrorModal("Error", "Failed to delete student"));
    });
}


function handleAddForm() {
    document.getElementById("createProductForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = Object.fromEntries(new FormData(e.target).entries());
        formData.age = Number(formData.age);
        formData.grade = Number(formData.grade);

        const error = validateStudentData(formData);
        if (error) {
            showErrorModal("Validation Error", error);
            return;
        }

        fetch(BASE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        })
            .then(res => res.ok ? showSuccessModal("Success", "Student added!", () => window.location.href = "index.html") : Promise.reject("Add failed"))
            .catch(err => showErrorModal("Error", "Failed to add student"));
    });
}


function handleEditForm() {
    const params = new URLSearchParams(window.location.search);
    const studentId = params.get("id");

    fetch(`${BASE_URL}/${studentId}`)
        .then(res => res.json())
        .then(student => {
            const form = document.getElementById("editProductForm");
            form.name.value = student.name;
            form.surname.value = student.surname;
            form.fatherName.value = student.fatherName;
            form.profilePhoto.value = student.profilePhoto;
            form.age.value = student.age;
            form.grade.value = student.grade;
            form.bio.value = student.bio;
        })
        .catch(err => showErrorModal("Error", "Failed to load student"));

    document.getElementById("editProductForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = Object.fromEntries(new FormData(e.target).entries());
        formData.age = Number(formData.age);
        formData.grade = Number(formData.grade);

        const error = validateStudentData(formData);
        if (error) {
            showErrorModal("Validation Error", error);
            return;
        }

        fetch(`${BASE_URL}/${studentId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        })
            .then(res => res.ok ? showSuccessModal("Success", "Student updated!", () => window.location.href = "index.html") : Promise.reject("Update failed"))
            .catch(err => showErrorModal("Error", "Failed to update student"));
    });
}


function validateStudentData(data) {
    const fields = { name: data.name, surname: data.surname, fatherName: data.fatherName };
    const nameRegex = /^[a-zA-Z]+$/;

    for (let [key, value] of Object.entries(fields)) {
        if (!value || value.trim() === "") return `${key.charAt(0).toUpperCase() + key.slice(1)} cannot be empty!`;
        if (!nameRegex.test(value.trim())) return `${key} can only contain letters!`;
        if (value.trim().length < 2) return `${key} must be at least 2 characters!`;
        if (value.trim().length > 50) return `${key} cannot exceed 50 characters!`;
    }

    if (!data.profilePhoto || data.profilePhoto.trim() === "") return "Profile Photo cannot be empty!";
    if (!data.bio || data.bio.trim() === "") return "Bio cannot be empty!";

    const age = parseInt(data.age);
    if (isNaN(age) || age < 1 || age > 120) return "Age must be between 1 and 120!";

    const grade = parseInt(data.grade);
    if (isNaN(grade) || grade < 1 || grade > 100) return "Grade must be between 1 and 100!";

    return null;
}


function showModal(title, message, onConfirm) {
    Swal.fire({
        title, text: message, icon: 'warning', showCancelButton: true,
        confirmButtonColor: '#2196f3', cancelButtonColor: '#424242',
        confirmButtonText: 'Confirm', cancelButtonText: 'Cancel'
    }).then(result => result.isConfirmed && onConfirm());
}

function showSuccessModal(title, message, onClose) {
    Swal.fire({ title, text: message, icon: 'success', confirmButtonColor: '#4caf50', confirmButtonText: 'OK' })
        .then(() => onClose && onClose());
}

function showErrorModal(title, message) {
    Swal.fire({ title, text: message, icon: 'error', confirmButtonColor: '#f44336', confirmButtonText: 'OK' });
}
