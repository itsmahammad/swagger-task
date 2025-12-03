
const BASE_URL = "http://gadimovsabir-001-site9.mtempurl.com/api/Products";


document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector("tbody")) {
        // index.html → show product list
        getData();
    } else if (document.getElementById("createProductForm")) {
        // add.html → handle create form
        handleAddForm();
    } else if (document.getElementById("editProductForm")) {
        // edit.html → handle edit form
        handleEditForm();
    }
});

// ---------------------- INDEX.HTML ----------------------
async function getData() {
    try {
        const response = await fetch(BASE_URL);
        if (!response.ok) throw new Error(`Response status: ${response.status}`);

        const result = await response.json();

        const tbody = document.querySelector("tbody");
        tbody.innerHTML = "";

        result.forEach(product => {
            const tr = document.createElement("tr");

            const idTd = document.createElement("td");
            idTd.textContent = product.id;

            const nameTd = document.createElement("td");
            nameTd.textContent = product.name;

            const descriptionTd = document.createElement("td");
            descriptionTd.textContent = product.description;

            const priceTd = document.createElement("td");
            priceTd.textContent = product.price;

            const costPriceTd = document.createElement("td");
            costPriceTd.textContent = product.costPrice;

            const imageTd = document.createElement("td");
            imageTd.textContent = product.imagePath;

            const categoryIdTd = document.createElement("td");
            categoryIdTd.textContent = product.categoryId;

            // Edit button
            const editTd = document.createElement("td");
            const editBtn = document.createElement("button");
            editBtn.textContent = "Edit";
            editBtn.addEventListener("click", () => {
                window.location.href = `edit.html?id=${product.id}`;
            });
            editTd.appendChild(editBtn);

            // Delete button
            const deleteTd = document.createElement("td");
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.addEventListener("click", () => deleteProduct(product.id));
            deleteTd.appendChild(deleteBtn);

            tr.appendChild(idTd);
            tr.appendChild(nameTd);
            tr.appendChild(descriptionTd);
            tr.appendChild(priceTd);
            tr.appendChild(costPriceTd);
            tr.appendChild(imageTd);
            tr.appendChild(categoryIdTd);
            tr.appendChild(editTd);
            tr.appendChild(deleteTd);

            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error("Error fetching products:", error.message);
    }
}

// Delete a product
async function deleteProduct(id) {
    const confirmed = confirm("Are you sure you want to delete this product?");
    if (!confirmed) return;

    try {
        const response = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error(`Delete failed: ${response.status}`);

        alert("Product deleted successfully!");
        getData();
    } catch (error) {
        console.error("Error deleting product:", error.message);
    }
}

// ---------------------- ADD.HTML ----------------------
function handleAddForm() {
    const form = document.getElementById("createProductForm");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Collect form data
        const formData = Object.fromEntries(new FormData(form).entries());

        // Convert numeric fields
        formData.price = Number(formData.price);
        formData.costPrice = Number(formData.costPrice);
        formData.categoryId = Number(formData.categoryId);

        // Simple client-side validation
        if (!formData.name || !formData.description || !formData.imagePath) {
            alert("Please fill all required fields!");
            return;
        }
        if (isNaN(formData.price) || isNaN(formData.costPrice) || isNaN(formData.categoryId)) {
            alert("Price, Cost Price, and Category ID must be valid numbers!");
            return;
        }

        try {
            // Send POST request
            const response = await fetch(BASE_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            // Log full response body for debugging
            const resText = await response.text();
            console.log("Server response:", resText);

            if (!response.ok) {
                alert(`Failed to add product. Status: ${response.status}\nCheck console for details.`);
                throw new Error(`Failed to add product: ${response.status}`);
            }

            alert("Product added successfully!");
            window.location.href = "index.html";

        } catch (error) {
            console.error("POST error:", error);
            alert("Failed to add product. Check console.");
        }
    });
}

// ---------------------- EDIT.HTML ----------------------
function handleEditForm() {
    const form = document.getElementById("editProductForm");

    // Get product ID from URL
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");

    // Load product data into form
    fetch(`${BASE_URL}/${productId}`)
        .then(res => res.json())
        .then(product => {
            form.elements.name.value = product.name;
            form.elements.description.value = product.description;
            form.elements.price.value = product.price;
            form.elements.costPrice.value = product.costPrice;
            form.elements.imagePath.value = product.imagePath;
            form.elements.categoryId.value = product.categoryId;
        })
        .catch(err => console.error("Error fetching product:", err));

    // Handle form submit
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = Object.fromEntries(new FormData(form).entries());
        formData.price = Number(formData.price);
        formData.costPrice = Number(formData.costPrice);
        formData.categoryId = Number(formData.categoryId);

        try {
            const response = await fetch(`${BASE_URL}/${productId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error(`Failed to update product: ${response.status}`);

            alert("Product updated successfully!");
            window.location.href = "index.html";

        } catch (error) {
            console.error(error.message);
            alert("Failed to update product. Check console.");
        }
    });
}
