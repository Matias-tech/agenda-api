// Dashboard JavaScript para el Panel de Gestión de Correos
class EmailDashboard {
    constructor() {
        this.baseUrl = window.location.origin;
        this.currentProject = null; // Used for template management
        this.projects = []; // Stores all projects, used by project list and all project selectors
        this.statsData = null;
        this.statsDataTimestamp = 0;
        this.cacheDuration = 10000;

        // Service Management
        this.serviceForm = null;
        this.servicesListContainer = null;
        this.serviceApiProjectSelect = null;
        this.allServicesList = [];

        // Availability Management
        this.availabilityFormContainer = null;
        this.availabilityForm = null;
        this.availabilityListContainer = null;
        this.availabilityPaginationContainer = null;
        this.availFilterProjectSelect = null;
        this.availabilityApiProjectSelect = null;
        this.currentAvailabilityPage = 1;
        this.availabilityList = [];

        // Appointment Management
        this.appointmentListContainer = null;
        this.appointmentPaginationContainer = null;
        this.apptFilterProjectSelect = null;
        this.apptFilterServiceSelect = null;
        this.currentAppointmentPage = 1;
        this.appointmentsList = [];

        // Project CRUD
        this.projectFormContainer = null;
        this.projectForm = null;
        // this.projectsListContainer is #projects-list (already used by renderProjects)

        this.init();
    }

    async init() {
        // Order of loading: Projects first, then services (which might depend on projects for display)
        await this.loadProjects();
        await this.loadServices();
        await this.loadStats();
        await this.loadEmailLogs();

        // Initialize DOM elements
        this.serviceFormContainer = document.getElementById('service-form-container');
        this.serviceForm = document.getElementById('service-form');
        this.servicesListContainer = document.getElementById('services-list-container');
        this.serviceApiProjectSelect = document.getElementById('service-api-project');

        this.availabilityFormContainer = document.getElementById('availability-form-container');
        this.availabilityForm = document.getElementById('availability-form');
        this.availabilityListContainer = document.getElementById('availability-list-container');
        this.availabilityPaginationContainer = document.getElementById('availability-pagination-container');
        this.availFilterProjectSelect = document.getElementById('avail-filter-project');
        this.availabilityApiProjectSelect = document.getElementById('availability-api-project');

        this.appointmentListContainer = document.getElementById('appointment-list-container');
        this.appointmentPaginationContainer = document.getElementById('appointment-pagination-container');
        this.apptFilterProjectSelect = document.getElementById('appt-filter-project');
        this.apptFilterServiceSelect = document.getElementById('appt-filter-service');

        this.projectFormContainer = document.getElementById('project-form-container');
        this.projectForm = document.getElementById('project-form');

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Project CRUD
        const showAddProjectFormBtn = document.getElementById('show-add-project-form-btn');
        if (showAddProjectFormBtn) showAddProjectFormBtn.addEventListener('click', () => this.showProjectForm());
        const cancelProjectFormBtn = document.getElementById('cancel-project-form-btn');
        if (cancelProjectFormBtn) cancelProjectFormBtn.addEventListener('click', () => this.hideProjectForm());
        if (this.projectForm) this.projectForm.addEventListener('submit', (e) => this.handleProjectFormSubmit(e));
        const projectsListEl = document.getElementById('projects-list');
        if (projectsListEl) projectsListEl.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-project-btn')) {
                const project = this.projects.find(p => p.id === e.target.dataset.id);
                if (project) this.showProjectForm(project);
            }
            if (e.target.classList.contains('deactivate-project-btn')) {
                this.deactivateProject(e.target.dataset.id, e.target.dataset.name);
            }
        });

        // Service Management
        const showAddServiceFormBtn = document.getElementById('show-add-service-form-btn');
        if (showAddServiceFormBtn) showAddServiceFormBtn.addEventListener('click', () => this.showServiceForm());
        const cancelServiceFormBtn = document.getElementById('cancel-service-form-btn');
        if (cancelServiceFormBtn) cancelServiceFormBtn.addEventListener('click', () => this.hideServiceForm());
        if (this.serviceForm) this.serviceForm.addEventListener('submit', (e) => this.handleServiceFormSubmit(e));
        if (this.servicesListContainer) this.servicesListContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-service-btn')) {
                const service = this.allServicesList.find(s => s.id === e.target.dataset.id);
                if (service) this.showServiceForm(service); else this.showError('Service details not found.');
            }
            if (e.target.classList.contains('delete-service-btn')) this.handleDeleteService(e.target.dataset.id);
        });

        // Availability Management
        const applyAvailFiltersBtn = document.getElementById('apply-availability-filters-btn');
        if (applyAvailFiltersBtn) applyAvailFiltersBtn.addEventListener('click', () => this.loadAvailability(1));
        const showAddAvailFormBtn = document.getElementById('show-add-availability-form-btn');
        if (showAddAvailFormBtn) showAddAvailFormBtn.addEventListener('click', () => this.showAvailabilityForm());
        const cancelAvailFormBtn = document.getElementById('cancel-availability-form-btn');
        if (cancelAvailFormBtn) cancelAvailFormBtn.addEventListener('click', () => this.hideAvailabilityForm());
        if (this.availabilityForm) this.availabilityForm.addEventListener('submit', (e) => this.handleAvailabilityFormSubmit(e));
        if (this.availabilityListContainer) this.availabilityListContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-availability-btn')) {
                const slot = this.availabilityList.find(s => s.id === e.target.dataset.id);
                if (slot) this.showAvailabilityForm(slot); else this.showError('Availability slot not found.');
            }
            if (e.target.classList.contains('delete-availability-btn')) this.handleDeleteAvailability(e.target.dataset.id);
        });
        if (this.availabilityPaginationContainer) this.availabilityPaginationContainer.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON' && e.target.dataset.page) this.loadAvailability(parseInt(e.target.dataset.page));
        });

        // Appointment Management
        const applyApptFiltersBtn = document.getElementById('apply-appointment-filters-btn');
        if (applyApptFiltersBtn) applyApptFiltersBtn.addEventListener('click', () => this.loadAppointments(1));
        if (this.appointmentListContainer) this.appointmentListContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('cancel-appointment-btn')) {
                const appointmentId = e.target.dataset.id;
                if (appointmentId) this.cancelAppointmentAction(appointmentId);
            }
        });
        if (this.appointmentPaginationContainer) this.appointmentPaginationContainer.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON' && e.target.dataset.page) this.loadAppointments(parseInt(e.target.dataset.page));
        });
    }

    async loadProjects() {
        try {
            const response = await fetch(`${this.baseUrl}/api/emails/projects`); // Endpoint lists all projects
            const data = await response.json();
            if (data.success) {
                this.projects = data.projects || [];
                this.renderProjects(); // Renders the main project list with CRUD buttons
                this.populateProjectSelector(); // Populates all project dropdowns across the dashboard
            } else {
                this.showError('Error loading projects: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error cargando proyectos:', error);
            this.showError('Error al cargar proyectos.');
        }
    }

    renderProjects() { // Now includes Edit/Deactivate buttons
        const container = document.getElementById('projects-list');
        if (!container) return;

        const projectFormContainer = document.getElementById('project-form-container');
        if (projectFormContainer && projectFormContainer.style.display === 'block') {
            // If form is visible, perhaps don't re-render the list or handle state carefully
            // For now, assume list is hidden or it's okay to re-render
        }

        if (this.projects.length === 0) {
            container.innerHTML = '<p class="stat-label">No projects configured. Click "Add New Project".</p>';
            return;
        }

        container.innerHTML = this.projects.map(p => `
            <div style="padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>${p.brand_name}</strong> (${p.name})<br>
                    <small class="stat-label">
                        ${p.is_active ? '<span style="color:green;">✅ Active</span>' : '<span style="color:red;">❌ Inactive</span>'}
                        <br>Default From: ${p.from_email || 'Not set'}
                    </small>
                </div>
                <div>
                    <button class="btn btn-primary btn-sm edit-project-btn" data-id="${p.id}" style="margin-right: 5px;">Edit</button>
                    <button class="btn btn-warning btn-sm deactivate-project-btn" data-id="${p.id}" data-name="${p.brand_name}" ${!p.is_active ? 'disabled' : ''}>
                        ${p.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <!-- Activate functionality might need a different endpoint or logic on backend PUT -->
                </div>
            </div>`).join('');
    }

    showProjectForm(project = null) {
        if (!this.projectForm || !this.projectFormContainer) return;
        this.projectForm.reset();
        const titleEl = document.getElementById('project-form-title');
        const idInput = document.getElementById('project-form-name'); // This is the 'id' for the backend
        const originalIdField = document.getElementById('project-form-id'); // Hidden field for original id during edit

        originalIdField.value = ''; // Clear hidden original ID field

        if (project) {
            titleEl.textContent = 'Edit Project';
            idInput.value = project.id; // `id` from project object, which is `name` in db table schema
            idInput.readOnly = true; // Prevent editing of ID for existing projects
            originalIdField.value = project.id; // Store original ID for submission if needed, though not strictly necessary if ID is in main input

            document.getElementById('project-form-brand-name').value = project.brand_name || '';
            document.getElementById('project-form-logo-url').value = project.logo_url || '';
            document.getElementById('project-form-primary-color').value = project.primary_color || '';
            document.getElementById('project-form-contact-email').value = project.contact_email || '';
            document.getElementById('project-form-contact-phone').value = project.contact_phone || '';
            document.getElementById('project-form-website-url').value = project.website_url || '';
            document.getElementById('project-form-address').value = project.address || '';
            document.getElementById('project-form-resend-api-key').value = project.resend_api_key ? '********' : ''; // Mask or indicate if set
            document.getElementById('project-form-from-email').value = project.from_email || '';
        } else {
            titleEl.textContent = 'Add New Project';
            idInput.readOnly = false;
            document.getElementById('project-form-resend-api-key').value = ''; // Clear password field
        }
        this.projectFormContainer.style.display = 'block';
    }

    hideProjectForm() {
        if (!this.projectFormContainer || !this.projectForm) return;
        this.projectForm.reset();
        this.projectFormContainer.style.display = 'none';
        document.getElementById('project-form-name').readOnly = false; // Reset readonly state
    }

    async handleProjectFormSubmit(event) {
        event.preventDefault();
        if (!this.projectForm) return;
        const formData = new FormData(this.projectForm);
        const data = Object.fromEntries(formData.entries());

        // The 'id' field from the form (`project-form-name`) is what backend expects as `id`.
        // `id_original` is not needed by backend for POST, as it determines new/update by presence of `id` in db.
        delete data.id_original;

        // If API key is '********', it means it wasn't changed. Don't send it.
        // Backend should only update key if a new non-placeholder value is sent.
        if (data.resend_api_key === '********') {
            delete data.resend_api_key;
        }

        try {
            // Backend POST /api/emails/projects handles both create and update
            const response = await fetch(`${this.baseUrl}/api/emails/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (result.success) {
                this.showSuccess(`Project ${data.id} ${result.message.includes("creado") ? 'created' : 'updated'}.`);
                this.hideProjectForm();
                await this.loadProjects(); // Refresh project list and all selectors
            } else {
                this.showError(result.error || `Error saving project.`);
            }
        } catch (error) {
            this.showError(`Request failed: ${error.message}`);
        }
    }

    async deactivateProject(projectId, projectName) {
        if (!confirm(`Are you sure you want to deactivate project: ${projectName} (${projectId})? This will also deactivate its templates.`)) return;
        try {
            const response = await fetch(`${this.baseUrl}/api/emails/projects/${projectId}`, { method: 'DELETE' });
            const result = await response.json();
            if (result.success) {
                this.showSuccess(`Project ${projectName} deactivated.`);
                await this.loadProjects(); // Refresh list
            } else {
                this.showError(result.error || `Error deactivating project.`);
            }
        } catch (error) {
            this.showError(`Request failed: ${error.message}`);
        }
    }

    // Populate selectors for ALL relevant dropdowns
    populateProjectSelector() {
        const selectors = [
            { el: document.getElementById('project-select'), defaultAll: false, placeholder: "Seleccione un proyecto..." },
            { el: this.serviceApiProjectSelect, defaultAll: false, placeholder: "Select Project" },
            { el: this.availFilterProjectSelect, defaultAll: true, placeholder: "All Projects" },
            { el: this.availabilityApiProjectSelect, defaultAll: false, placeholder: "Select Project" },
            { el: this.apptFilterProjectSelect, defaultAll: true, placeholder: "All Projects" }
        ];

        selectors.forEach(({ el, defaultAll, placeholder }) => {
            if (!el) return;
            const currentValue = el.value;
            el.innerHTML = `<option value="">${placeholder}</option>`; // Set specific placeholder
            this.projects.forEach(project => { // Populate with all projects, active or not, for filtering/selection consistency
                const option = document.createElement('option');
                option.value = project.id;
                option.textContent = `${project.brand_name} (${project.id})${!project.is_active ? ' [Inactive]' : ''}`;
                el.appendChild(option);
            });
            // For forms, filter to only active projects if desired, or indicate status
            if (el === this.serviceApiProjectSelect || el === this.availabilityApiProjectSelect) {
                 // Example: Keep only active projects for forms, or indicate status
                 el.innerHTML = `<option value="">${placeholder}</option>`;
                 this.projects.filter(p => p.is_active).forEach(project => {
                    const option = document.createElement('option');
                    option.value = project.id;
                    option.textContent = `${project.brand_name} (${project.id})`;
                    el.appendChild(option);
                });
            }
            if (currentValue && Array.from(el.options).some(opt => opt.value === currentValue)) el.value = currentValue;
        });
    }

    async loadServices() {
        if (this.servicesListContainer) this.showLoadingIndicator('services-list-container', 'Loading services...');
        try {
            const response = await fetch(`${this.baseUrl}/api/services`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            if (data.success) {
                this.allServicesList = data.services || [];
                if (this.servicesListContainer) this.renderServices(this.allServicesList);
                this.populateServiceFilterSelector(this.allServicesList);
            } else {
                this.showError('Error loading services: ' + (data.message || 'Unknown error'));
                if (this.servicesListContainer) this.renderServices([]);
                this.populateServiceFilterSelector([]);
            }
        } catch (error) {
            console.error('Error cargando todos los servicios:', error);
            this.showError('Error fetching all services: ' + error.message);
            if (this.servicesListContainer) this.renderServices([]);
            this.populateServiceFilterSelector([]);
        }
    }

    populateServiceFilterSelector(services) {
        const selectElement = this.apptFilterServiceSelect;
        if (!selectElement) return;
        const currentValue = selectElement.value;
        selectElement.innerHTML = '<option value="">All Services</option>';
        if (services && services.length > 0) {
            services.forEach(service => {
                const project = this.projects.find(p => p.id === service.api_service_id);
                const option = document.createElement('option');
                option.value = service.id;
                option.textContent = project ? `${service.name} (${project.brand_name})` : service.name;
                 if(service.is_active === false) option.textContent += ' [Inactive]'; // Indicate if service is inactive
                selectElement.appendChild(option);
            });
        }
        if (currentValue && Array.from(selectElement.options).some(opt => opt.value === currentValue)) selectElement.value = currentValue;
    }

    renderServices(services) {
        if (!this.servicesListContainer) return;
        if (!services || services.length === 0) {
            this.servicesListContainer.innerHTML = '<p class="stat-label">No services found.</p>'; return;
        }
        this.servicesListContainer.innerHTML = `
            <table class="logs-table" style="margin-top: 1rem;"><thead><tr>
                <th>Name</th><th>Duration</th><th>Price</th><th>Project</th><th>Category</th><th>Active</th><th>Actions</th>
            </tr></thead><tbody>
            ${services.map(s => {
                const p = this.projects.find(pr => pr.id === s.api_service_id);
                return `<tr>
                    <td>${s.name}</td><td>${s.duration} min</td><td>$${s.price ? parseFloat(s.price).toFixed(2) : 'N/A'}</td>
                    <td>${p ? p.brand_name : (s.api_service_id || '-')}</td><td>${s.category || '-'}</td>
                    <td>${s.is_active ? 'Yes' : 'No'}</td>
                    <td>
                        <button class="btn btn-primary btn-sm edit-service-btn" data-id="${s.id}">Edit</button>
                        <button class="btn btn-warning btn-sm delete-service-btn" data-id="${s.id}">Delete</button>
                    </td></tr>`;
            }).join('')}</tbody></table>`;
    }

    showServiceForm(service = null) {
        if (!this.serviceForm || !this.serviceFormContainer) return;
        this.serviceForm.reset();
        document.getElementById('service-id').value = '';
        if (service) {
            document.getElementById('service-id').value = service.id;
            document.getElementById('service-name').value = service.name;
            document.getElementById('service-description').value = service.description || '';
            document.getElementById('service-duration').value = service.duration;
            document.getElementById('service-price').value = service.price ? parseFloat(service.price).toFixed(2) : '';
            if (this.serviceApiProjectSelect) this.serviceApiProjectSelect.value = service.api_service_id || '';
            document.getElementById('service-category').value = service.category || '';
        }
        this.serviceFormContainer.style.display = 'block';
        if(this.servicesListContainer) this.servicesListContainer.style.display = 'none';
        const addBtn = document.getElementById('show-add-service-form-btn');
        if(addBtn) addBtn.style.display = 'none';
    }

    hideServiceForm() {
        if (!this.serviceForm || !this.serviceFormContainer) return;
        this.serviceForm.reset();
        this.serviceFormContainer.style.display = 'none';
        if(this.servicesListContainer) this.servicesListContainer.style.display = 'block';
        const addBtn = document.getElementById('show-add-service-form-btn');
        if(addBtn) addBtn.style.display = 'inline-block';
    }

    async handleServiceFormSubmit(event) {
        event.preventDefault();
        if (!this.serviceForm) return;
        const formData = new FormData(this.serviceForm);
        const serviceId = formData.get('id'); // This is the actual service ID for edits, or empty for new
        const data = {
            name: formData.get('name'), description: formData.get('description'),
            duration: parseInt(formData.get('duration'), 10), price: parseFloat(formData.get('price')),
            api_service_id: formData.get('api_service'), category: formData.get('category')
        };
        // For new services, the actual ID will be generated by backend.
        // For existing, we pass the serviceId in the URL.
        if(serviceId) data.id = serviceId;


        if (!data.name || !data.duration || !data.api_service_id) { this.showError('Name, Duration, Project are required.'); return; }

        const url = serviceId ? `${this.baseUrl}/api/services/${serviceId}` : `${this.baseUrl}/api/services`;
        const method = serviceId ? 'PUT' : 'POST';
        try {
            const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            const result = await response.json();
            if (result.success) {
                this.showSuccess(`Service ${result.service && result.service.name ? result.service.name : data.name} ${serviceId ? 'updated' : 'created'}.`);
                this.hideServiceForm(); await this.loadServices();
            } else this.showError(result.error || `Error ${serviceId ? 'updating' : 'creating'} service.`);
        } catch (error) { this.showError(`Request failed: ${error.message}`); }
    }

    async handleDeleteService(serviceId) {
        if (!confirm(`Delete service ${serviceId}?`)) return;
        try {
            const response = await fetch(`${this.baseUrl}/api/services/${serviceId}`, { method: 'DELETE' });
            const result = await response.json();
            if (result.success) { this.showSuccess(`Service ${serviceId} deleted.`); await this.loadServices(); }
            else this.showError(result.error || `Error deleting service.`);
        } catch (error) { this.showError(`Request failed: ${error.message}`); }
    }

    // Availability Management Methods (Copied from previous state, ensure correctness)
    async loadAvailability(page = 1) {
        this.currentAvailabilityPage = page;
        if (!this.availabilityListContainer) return;
        this.showLoadingIndicator('availability-list-container', 'Loading availability slots...');
        if(this.availabilityPaginationContainer) this.availabilityPaginationContainer.innerHTML = '';
        const filters = {
            start_date: document.getElementById('avail-filter-date-start').value,
            end_date: document.getElementById('avail-filter-date-end').value,
            api_service: document.getElementById('avail-filter-project').value,
            is_available: document.getElementById('avail-filter-status').value,
            limit: 10, page
        };
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => { if (value) queryParams.append(key, value); });
        try {
            const response = await fetch(`${this.baseUrl}/api/availability/admin/all?${queryParams.toString()}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const result = await response.json();
            if (result.success) {
                this.availabilityList = result.data || [];
                this.renderAvailability(this.availabilityList);
                this.renderAvailabilityPagination(result.pagination);
            } else { this.showError(result.error || 'Error loading availability.'); this.renderAvailability([]); }
        } catch (error) { this.showError('Failed to fetch availability: ' + error.message); this.renderAvailability([]); }
    }

    renderAvailability(slots) {
        if (!this.availabilityListContainer) return;
        if (!slots || slots.length === 0) { this.availabilityListContainer.innerHTML = '<p class="stat-label">No availability found.</p>'; return; }
        this.availabilityListContainer.innerHTML = `
            <table class="logs-table" style="margin-top:1rem;"><thead><tr><th>Date</th><th>Start</th><th>End</th><th>Project</th><th>User ID</th><th>Status</th><th>Actions</th></tr></thead><tbody>
            ${slots.map(s => {
                const p = this.projects.find(pr => pr.id === s.api_service); // Ensure this.projects is populated
                return `<tr><td>${s.date}</td><td>${s.start_time}</td><td>${s.end_time}</td>
                    <td>${p ? p.brand_name : (s.api_service || '-')}</td><td>${s.user_id || '-'}</td>
                    <td>${s.is_available ? '✅ Available' : '❌ Unavailable'}</td>
                    <td><button class="btn btn-primary btn-sm edit-availability-btn" data-id="${s.id}">Edit</button>
                        <button class="btn btn-warning btn-sm delete-availability-btn" data-id="${s.id}">Delete</button></td></tr>`;
            }).join('')}</tbody></table>`;
    }

    renderAvailabilityPagination(pagination) {
        const container = this.availabilityPaginationContainer;
        if (!container || !pagination || pagination.total_pages <= 1) { if(container) container.innerHTML = ''; return; }
        let html = '';
        if (pagination.current_page > 1) html += `<button class="btn btn-sm" data-page="${pagination.current_page - 1}" style="margin-right:2px;">&laquo; Prev</button>`;
        for (let i = 1; i <= pagination.total_pages; i++) {
            html += `<button class="btn btn-sm ${i === pagination.current_page ? 'btn-primary' : ''}" data-page="${i}" ${i === pagination.current_page ? 'disabled' : ''} style="margin:0 2px;">${i}</button>`;
        }
        if (pagination.current_page < pagination.total_pages) html += `<button class="btn btn-sm" data-page="${pagination.current_page + 1}" style="margin-left:2px;">Next &raquo;</button>`;
        container.innerHTML = html;
    }

    showAvailabilityForm(slot = null) {
        if (!this.availabilityForm || !this.availabilityFormContainer) return;
        this.availabilityForm.reset();
        document.getElementById('availability-id').value = '';
        if (slot) {
            document.getElementById('availability-id').value = slot.id;
            document.getElementById('availability-date').value = slot.date;
            document.getElementById('availability-start-time').value = slot.start_time;
            document.getElementById('availability-end-time').value = slot.end_time;
            document.getElementById('availability-api-project').value = slot.api_service || '';
            document.getElementById('availability-user-id').value = slot.user_id || '';
            document.getElementById('availability-is-available').checked = slot.is_available;
        } else document.getElementById('availability-is-available').checked = true;
        this.availabilityFormContainer.style.display = 'block';
        if(this.availabilityListContainer) this.availabilityListContainer.style.display = 'none';
        if(this.availabilityPaginationContainer) this.availabilityPaginationContainer.style.display = 'none';
        const addBtn = document.getElementById('show-add-availability-form-btn'); if(addBtn) addBtn.style.display = 'none';
        const filtersEl = document.getElementById('availability-filters'); if(filtersEl) filtersEl.style.display = 'none';
    }

    hideAvailabilityForm() {
        if (!this.availabilityForm || !this.availabilityFormContainer) return;
        this.availabilityForm.reset();
        this.availabilityFormContainer.style.display = 'none';
        if(this.availabilityListContainer) this.availabilityListContainer.style.display = 'block';
        if(this.availabilityPaginationContainer) this.availabilityPaginationContainer.style.display = 'block';
        const addBtn = document.getElementById('show-add-availability-form-btn'); if(addBtn) addBtn.style.display = 'inline-block';
        const filtersEl = document.getElementById('availability-filters'); if(filtersEl) filtersEl.style.display = 'block';
    }

    async handleAvailabilityFormSubmit(event) {
        event.preventDefault();
        if (!this.availabilityForm) return;
        const formData = new FormData(this.availabilityForm);
        const slotId = formData.get('id');
        const data = {
            date: formData.get('date'), start_time: formData.get('start_time'), end_time: formData.get('end_time'),
            api_service: formData.get('api_service') || null, user_id: formData.get('user_id') || null,
            is_available: document.getElementById('availability-is-available').checked
        };
        if (!data.date || !data.start_time || !data.end_time) { this.showError('Date, Start Time, End Time are required.'); return; }
        const url = slotId ? `${this.baseUrl}/api/availability/${slotId}` : `${this.baseUrl}/api/availability`;
        const method = slotId ? 'PUT' : 'POST';
        try {
            const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            const result = await response.json();
            if (result.success) {
                this.showSuccess(`Availability ${slotId ? 'updated' : 'created'}.`);
                this.hideAvailabilityForm(); await this.loadAvailability(this.currentAvailabilityPage);
            } else this.showError(result.error || `Error ${slotId ? 'updating' : 'creating'} slot.`);
        } catch (error) { this.showError(`Request failed: ${error.message}`); }
    }

    async handleDeleteAvailability(slotId) {
        if (!confirm(`Delete availability slot ${slotId}?`)) return;
        try {
            const response = await fetch(`${this.baseUrl}/api/availability/${slotId}`, { method: 'DELETE' });
            const result = await response.json();
            if (result.success) { this.showSuccess(`Slot ${slotId} deleted.`); await this.loadAvailability(this.currentAvailabilityPage); }
            else this.showError(result.error || `Error deleting slot.`);
        } catch (error) { this.showError(`Request failed: ${error.message}`); }
    }

    // Appointment Management Methods
    async loadAppointments(page = 1) {
        this.currentAppointmentPage = page;
        if (!this.appointmentListContainer) return;
        this.showLoadingIndicator('appointment-list-container', 'Loading appointments...');
        if (this.appointmentPaginationContainer) this.appointmentPaginationContainer.innerHTML = '';

        const filters = {
            date_start: document.getElementById('appt-filter-date-start').value,
            date_end: document.getElementById('appt-filter-date-end').value,
            api_service_id: document.getElementById('appt-filter-project').value,
            service_id: document.getElementById('appt-filter-service').value,
            status: document.getElementById('appt-filter-status').value,
            user_query: document.getElementById('appt-filter-user-query').value,
            limit: 15, page
        };
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => { if (value) queryParams.append(key, value); });

        try {
            const response = await fetch(`${this.baseUrl}/api/appointments/admin/all?${queryParams.toString()}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const result = await response.json();
            if (result.success) {
                this.appointmentsList = result.data || [];
                this.renderAppointments(this.appointmentsList);
                this.renderAppointmentPagination(result.pagination);
            } else { this.showError(result.error || 'Error loading appointments.'); this.renderAppointments([]); }
        } catch (error) { this.showError('Failed to fetch appointments: ' + error.message); this.renderAppointments([]); }
    }

    renderAppointments(appointments) {
        if (!this.appointmentListContainer) return;
        if (!appointments || appointments.length === 0) { this.appointmentListContainer.innerHTML = '<p class="stat-label">No appointments found.</p>'; return; }
        this.appointmentListContainer.innerHTML = `
            <table class="logs-table" style="margin-top:1rem;"><thead><tr>
                <th>Date & Time</th><th>User</th><th>Service</th><th>Project</th><th>Status</th><th>Actions</th>
            </tr></thead><tbody>
            ${appointments.map(appt => {
                const apptDate = new Date(appt.date + 'T' + appt.start_time);
                const formattedDateTime = this.formatDate(apptDate);
                const statusClass = appt.status === 'confirmed' ? 'status-success' : (appt.status === 'cancelled' ? 'status-error' : 'status-pending');
                return `<tr>
                    <td>${formattedDateTime}</td>
                    <td>${appt.user_name || 'N/A'}<br><small>${appt.user_email || ''}</small></td>
                    <td>${appt.service_name || 'N/A'}</td>
                    <td>${appt.project_brand_name || (appt.service_api_service_id ? `ID: ${appt.service_api_service_id}` : 'N/A')}</td>
                    <td><span class="status-badge ${statusClass}">${appt.status}</span></td>
                    <td><button class="btn btn-warning btn-sm cancel-appointment-btn" data-id="${appt.id}" ${appt.status === 'cancelled' ? 'disabled' : ''}>Cancel</button></td>
                </tr>`;
            }).join('')}</tbody></table>`;
    }

    renderAppointmentPagination(pagination) {
        const container = this.appointmentPaginationContainer;
        if (!container || !pagination || pagination.total_pages <= 1) { if(container) container.innerHTML = ''; return; }
        let html = '';
        if (pagination.current_page > 1) html += `<button class="btn btn-sm" data-page="${pagination.current_page - 1}" style="margin-right:2px;">&laquo; Prev</button>`;
        for (let i = 1; i <= pagination.total_pages; i++) {
            html += `<button class="btn btn-sm ${i === pagination.current_page ? 'btn-primary' : ''}" data-page="${i}" ${i === pagination.current_page ? 'disabled' : ''} style="margin:0 2px;">${i}</button>`;
        }
        if (pagination.current_page < pagination.total_pages) html += `<button class="btn btn-sm" data-page="${pagination.current_page + 1}" style="margin-left:2px;">Next &raquo;</button>`;
        container.innerHTML = html;
    }

    async cancelAppointmentAction(appointmentId) {
        if (!confirm(`Are you sure you want to cancel appointment ${appointmentId}?`)) return;
        try {
            const response = await fetch(`${this.baseUrl}/api/appointments/${appointmentId}/cancel`, { method: 'POST' });
            const result = await response.json();
            if (response.ok && result.message) {
                this.showSuccess(result.message || `Appointment ${appointmentId} cancelled.`);
                await this.loadAppointments(this.currentAppointmentPage);
            } else {
                this.showError(result.error || `Error cancelling appointment ${appointmentId}.`);
            }
        } catch (error) { this.showError(`Request failed: ${error.message}`); }
    }

    // General Helper Methods
    async loadStats() {
        if (this.statsData && (Date.now() - this.statsDataTimestamp < this.cacheDuration)) {
            this.renderStats(this.statsData); return;
        }
        try {
            const response = await fetch(`${this.baseUrl}/api/emails/stats?days=7`);
            const data = await response.json();
            if (data.success) { this.statsData = data; this.statsDataTimestamp = Date.now(); this.renderStats(this.statsData); }
        } catch (error) { this.showError('Error al cargar estadísticas'); }
    }

    renderStats(data) {
        const container = document.getElementById('general-stats');
        if(!container || !data || !data.summary ) return; // Added checks for data and data.summary
        const statsHtml = `
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                <div><div class="stat-number">${data.summary.total_emails !== undefined ? data.summary.total_emails : 'N/A'}</div><div class="stat-label">Correos (7d)</div></div>
                <div><div class="stat-number">${data.summary.unique_appointments !== undefined ? data.summary.unique_appointments : 'N/A'}</div><div class="stat-label">Citas únicas</div></div>
            </div>
            <div style="margin-top: 1rem;"><div class="stat-number">${data.summary.active_projects !== undefined ? data.summary.active_projects : 'N/A'}</div><div class="stat-label">Proyectos activos</div></div>`;
        container.innerHTML = statsHtml;
    }

    async loadProjectTemplates() {
        const projectId = document.getElementById('project-select').value;
        const container = document.getElementById('templates-section');
        if (!container) return;
        if (!projectId) { container.style.display = 'none'; return; }
        this.currentProject = projectId;
        try {
            const response = await fetch(`${this.baseUrl}/api/emails/templates/${projectId}`);
            const data = await response.json();
            if (data.success) { this.renderTemplates(data.templates); container.style.display = 'block'; }
        } catch (error) { this.showError('Error al cargar templates'); }
    }

    renderTemplates(templates) {
        const container = document.getElementById('templates-grid');
        if(!container) return;
        if (!templates || templates.length === 0) { // Added check for templates array
            container.innerHTML = `<div class="template-card"><p>No templates configurados</p><button class="btn btn-success" onclick="dashboard.initializeTemplates('${this.currentProject}')">🚀 Inicializar</button></div>`;
            return;
        }
        const typeNames = {'appointment_confirmation': '✅ Confirmación', 'appointment_reminder': '⏰ Recordatorio', 'appointment_cancellation': '❌ Cancelación', 'appointment_pending': '📝 Pendiente', 'appointment_rescheduled': '📅 Reagendado'};
        container.innerHTML = templates.map(t => `
            <div class="template-card"><div class="template-type">${typeNames[t.email_type] || t.email_type}</div>
            <small class="stat-label">ID: ${t.id}</small><br><br>
            <button class="btn btn-primary" onclick="dashboard.previewTemplate('${this.currentProject}', '${t.email_type}')">👁️ Previsualizar</button></div>`).join('');
    }

    async initializeTemplates(projectId) {
        try {
            const response = await fetch(`${this.baseUrl}/api/emails/templates/init/${projectId}`, { method: 'POST' });
            const data = await response.json();
            if (data.success) { this.showSuccess(`Templates inicializados: ${data.created} creados.`); await this.loadProjectTemplates(); }
            else this.showError(data.message || 'Error al inicializar templates');
        } catch (error) { this.showError('Error al inicializar templates'); }
    }

    async previewTemplate(projectId, emailType) {
        try {
            const response = await fetch(`${this.baseUrl}/api/emails/templates/preview/${projectId}/${emailType}`);
            const data = await response.json();
            this.renderEmailPreview(data);
            const previewSection = document.getElementById('email-preview-section'); if(previewSection) previewSection.style.display = 'block';
            const noPreview = document.getElementById('no-preview'); if(noPreview) noPreview.style.display = 'none';
            if(previewSection) previewSection.scrollIntoView({ behavior: 'smooth' });
        } catch (error) { this.showError('Error al cargar preview'); }
    }

    renderEmailPreview(data) {
        const container = document.getElementById('email-preview');
        if(!container || !data || !data.template_info) return; // Added checks
        container.innerHTML = `
            <div class="email-preview-header"><strong>📧 Asunto:</strong> ${data.subject || ''}<br><small class="stat-label">Template: ${data.template_info.id} | Actualizado: ${data.template_info.updated_at}</small></div>
            <div class="email-preview-body"><div style="border:1px solid #ddd; border-radius:4px; padding:1rem; background:white;">${data.html || ''}</div>
            <details style="margin-top:1rem;"><summary style="cursor:pointer; font-weight:bold;">📝 Texto plano</summary><pre style="background:#f8f9fa; padding:1rem; margin-top:0.5rem; border-radius:4px; white-space:pre-wrap;">${data.text || ''}</pre></details></div>`;
    }

    async loadEmailLogs() {
        // This assumes statsData.details contains logs. If not, a separate /api/emails/logs endpoint might be needed.
        if (this.statsData && this.statsData.details && (Date.now() - this.statsDataTimestamp < this.cacheDuration)) {
             this.renderEmailLogs(this.statsData.details); return;
        }
        try {
            const response = await fetch(`${this.baseUrl}/api/emails/stats?days=7`);
            const data = await response.json();
            if (data.success) { this.statsData = data; this.statsDataTimestamp = Date.now(); this.renderEmailLogs(this.statsData.details || []); } // Ensure details is an array
        } catch (error) { this.showError('Error al cargar logs'); }
    }

    renderEmailLogs(logs) {
        const container = document.getElementById('email-logs');
        if(!container) return;
        if (!logs || logs.length === 0) { container.innerHTML = `<div class="alert alert-info">No hay logs de correos en los últimos 7 días.</div>`; return; }
        container.innerHTML = `
            <table class="logs-table"><thead><tr><th>Fecha/Hora</th><th>Proyecto</th><th>Tipo</th><th>Destinatario</th><th>Estado</th><th>ID Cita</th></tr></thead><tbody>
            ${logs.map(log => `<tr><td>${this.formatDate(log.sent_at)}</td><td>${log.project_id}</td><td>${log.email_type}</td><td>${log.to_email}</td>
            <td><span class="status-badge status-${log.status === 'sent' ? 'success' : 'error'}">${log.status === 'sent' ? '✅ Enviado' : '❌ Error'}</span></td>
            <td>${log.appointment_id}</td></tr>`).join('')}</tbody></table>`;
    }

    async sendReminders() {
        if (!confirm('Enviar recordatorios ahora?')) return;
        try {
            const response = await fetch(`${this.baseUrl}/api/emails/reminders/send`, { method: 'POST' });
            const data = await response.json();
            if (data.success) { this.showSuccess(`Recordatorios: ${data.sent} enviados, ${data.errors} errores.`); await this.loadEmailLogs(); }
            else this.showError(data.message || 'Error enviando recordatorios.');
        } catch (error) { this.showError('Error enviando recordatorios.'); }
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', '');
    }

    showLoadingIndicator(containerId, message = "Loading...") {
        const container = document.getElementById(containerId);
        if (container) container.innerHTML = `<div class="loading" style="display:block; padding: 20px; text-align:center;">${message}</div>`;
    }

    displaySection(sectionId) {
        document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
        const activeSection = document.getElementById(sectionId);
        if (activeSection) activeSection.style.display = 'block';
    }

    showSuccess(message) { this.showMessage(message, 'success'); }
    showError(message) { this.showMessage(message, 'warning'); }
    showMessage(message, type) {
        const alertContainer = document.querySelector('.container'); // Ensure this is a valid, always present container
        if (!alertContainer) { console.error("Alert container not found"); return; }
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.style.cssText = "padding: 1rem; border-radius: 8px; margin: 1rem 0; position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 1000; min-width: 300px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);";
        alertDiv.innerHTML = `<strong>${type === 'success' ? '✅ Éxito:' : '⚠️ Error:'}</strong> ${message}<button onclick="this.parentElement.remove()" style="float:right;background:none;border:none;font-size:1.2rem;cursor:pointer; margin-left:15px; line-height:1;">&times;</button>`;

        // Insert where it's visible, e.g., top of the main container or body
        const firstGrid = alertContainer.querySelector('.dashboard-grid');
        if(firstGrid) alertContainer.insertBefore(alertDiv, firstGrid);
        else alertContainer.prepend(alertDiv);

        setTimeout(() => { if (alertDiv.parentElement) alertDiv.remove(); }, 5000);
    }
}

const dashboard = new EmailDashboard();
// Global functions for inline HTML event handlers (legacy, try to avoid if possible)
function loadStats() { dashboard.loadStats(); }
function loadEmailLogs() { dashboard.loadEmailLogs(); }
function sendReminders() { dashboard.sendReminders(); }
function loadProjectTemplates() { dashboard.loadProjectTemplates(); }

// Auto-refresh stats (example)
setInterval(() => {
    // dashboard.loadStats(); // Can be too frequent or disruptive, enable if needed
}, 30000);

// Initial load for the default visible section can be triggered here
// For example, if 'projects-list' related section is visible by default:
// document.addEventListener('DOMContentLoaded', () => {
//    dashboard.loadProjects(); // if projects are the default view.
// });
// Or handle via navigation clicks.
