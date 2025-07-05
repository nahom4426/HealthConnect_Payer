// employeesInContract.js

import { getPayerContractById } from './api/payerContractApi'; // Adjust path as needed
import { toasted } from './utils/utils'; // Adjust path as needed
import { openModal } from "@customizer/modal-x"; // Assuming this is a global utility
import icons from './utils/icons'; // Adjust path as needed

// Placeholder for unassignServicesFromGroup if needed by any modal opened by this store
// You'll need to define this in your payerContractApi.js or similar
// async function unassignServicesFromGroup(groupUuid, itemUuids) { /* ... */ }

const employeesInContract = {
  // Reactive State (in a plain JS store, these are just properties)
  // The consuming Vue component will need to make these reactive using ref()
  state: {
    contractData: {
      contractHeaderUuid: "",
      contractNumber: "",
      contractName: "",
      contractDescription: "",
      startDate: "",
      endDate: "",
      status: "",
      contractCode: "",
      providerName: "",
      providerAddress: "",
      contactPersonName: "",
      contactPersonNumber: "",
      totalInsured: 0,
      totalDependants: 0,
      contractDetails: [],
      insuredSummaries: [],
      employeeGroups: [],
    },
    activeTab: 'employees',
    employeeSearch: '',
    employeeCurrentPage: 1,
    employeeRowsPerPage: 10,
    serviceSearch: '',
    loadingContract: false,
    error: null,
  },

  // Getters (computed properties in Vue)
  getFilteredEmployees() {
    if (!this.state.contractData.insuredSummaries) return [];
    const searchTerm = this.state.employeeSearch.toLowerCase();
    return this.state.contractData.insuredSummaries.filter(e =>
      (e.fullName && e.fullName.toLowerCase().includes(searchTerm)) ||
      (e.membershipNumber && e.membershipNumber.toLowerCase().includes(searchTerm))
    );
  },

  getEmployeeStart() {
    return (this.state.employeeCurrentPage - 1) * this.state.employeeRowsPerPage;
  },

  getEmployeeEnd() {
    return this.getEmployeeStart() + this.state.employeeRowsPerPage;
  },

  getEmployeeTotalPages() {
    return Math.ceil(this.getFilteredEmployees().length / this.state.employeeRowsPerPage);
  },

  getPaginatedEmployees() {
    const start = this.getEmployeeStart();
    const end = this.getEmployeeEnd();
    return this.getFilteredEmployees().slice(start, end);
  },

  getFilteredServices() {
    if (!this.state.contractData.contractDetails) return [];
    const searchTerm = this.state.serviceSearch.toLowerCase();
    return this.state.contractData.contractDetails.filter(s =>
      (s.serviceName && s.serviceName.toLowerCase().includes(searchTerm)) ||
      (s.drugName && s.drugName.toLowerCase().includes(searchTerm))
    );
  },

  // Actions (methods in Vue)
  formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      console.error("Error formatting date:", e);
      return 'Invalid Date';
    }
  },

  getInitials(name) {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  },

  async fetchContract(contractId) {
    this.state.loadingContract = true;
    this.state.error = null;
    try {
      const response = await getPayerContractById(contractId);

      if (response && response.data) {
        this.state.contractData = {
          ...response.data,
          providerAddress: response.data.providerAddress || 'Arada, Around Semen City Hall, Addis Ababa',
          contactPersonName: response.data.contactPersonName || 'Birhane Araya',
          contactPersonNumber: response.data.contactPersonNumber || '+251 945065432',
          contractDetails: response.data.contractDetails || [],
          insuredSummaries: response.data.insuredSummaries || [],
          employeeGroups: response.data.employeeGroups || [],
        };
      } else {
        throw new Error('Contract data not found in response');
      }
    } catch (err) {
      console.error('Error fetching contract:', err);
      this.state.error = 'Failed to load contract data';
      toasted(false, 'Failed to load contract data');
      // router.push('/payer_contracts'); // This would be handled by the consuming component
    } finally {
      this.state.loadingContract = false;
    }
  },

  nextEmployeePage() {
    if (this.state.employeeCurrentPage < this.getEmployeeTotalPages()) {
      this.state.employeeCurrentPage++;
    }
  },

  prevEmployeePage() {
    if (this.state.employeeCurrentPage > 1) {
      this.state.employeeCurrentPage--;
    }
  },

  handleMembersAdded(newData) {
    // Create a deep copy of the current data
    const updatedData = JSON.parse(JSON.stringify(this.state.contractData));

    // Add new members to the insuredSummaries array
    newData.insuredSummaries.forEach(newMember => {
      if (!updatedData.insuredSummaries.some(m => m.insuredUuid === newMember.insuredUuid)) {
        updatedData.insuredSummaries.push(newMember);
      }
    });

    // Update the totals
    updatedData.totalInsured += newData.totalInsured;
    updatedData.totalDependants += newData.totalDependants;

    // Update the contract data in the store
    this.state.contractData = updatedData;

    // Reset pagination to force recomputation of filtered/paginated employees
    this.state.employeeCurrentPage = 1;
  },

  handleOpenModal(activeTabValue, contractHeaderUuid, groupUuid) {
    if (activeTabValue === 'groups') {
      openModal('AddGroupModal', {
        // onSaved: handleGroupSaved, // You'd need to define this callback in the consuming component
      });
    } else if (activeTabValue === 'employees') {
      openModal('AddEmployeeModal', {
        onMembersAdded: this.handleMembersAdded // Pass the store's handler
      });
    } else if (activeTabValue === 'services') {
      // For adding services/drugs
      openModal('AddServiceToContract', {
        data: {
          groupUuid: groupUuid, // Pass relevant groupUuid if needed
          contractHeaderUuid: contractHeaderUuid
        },
        // onSaved: () => this.fetchContract(contractHeaderUuid), // Re-fetch data on save
      });
    } else if (activeTabValue === 'remove-services') {
      // For removing services/drugs
      openModal('RemoveServicesModal', {
        data: {
          groupUuid: groupUuid, // Pass relevant groupUuid if needed
          contractHeaderUuid: contractHeaderUuid
        },
        // onSaved: () => this.fetchContract(contractHeaderUuid), // Re-fetch data on save
      });
    }
  },

  handleAddDependant(row) {
    if (row.insuredUuid) {
      openModal('AddDependant', {
        insuredUuid: row.insuredUuid,
        user: row,
        onUpdated: (updatedUser) => {
          // Find and update the user in insuredSummaries
          const index = this.state.contractData.insuredSummaries.findIndex(u => u.insuredUuid === updatedUser.insuredUuid);
          if (index !== -1) {
            this.state.contractData.insuredSummaries[index] = updatedUser;
          }
          // You might also need to update totalDependants if dependants are added/removed
          this.state.contractData.totalDependants = this.state.contractData.insuredSummaries.reduce((sum, emp) => sum + (emp.dependants?.length || 0), 0);
        }
      });
    } else {
      console.warn("Cannot add dependant: insuredUuid is missing.");
    }
  },

  // These would typically trigger API calls to update the backend
  handleRemoveWithClose(id) {
    console.log('Remove:', id);
    // Call API to remove, then re-fetch or update state
  },

  handleActivateWithClose(id) {
    console.log('Activate:', id);
    // Call API to activate, then re-fetch or update state
  },

  handleDeactivateWithClose(id) {
    console.log('Deactivate:', id);
    // Call API to deactivate, then re-fetch or update state
  },

  // Setter for activeTab (used by the consuming component)
  setActiveTab(tabName) {
    this.state.activeTab = tabName;
  },

  // Setters for search and pagination (used by the consuming component)
  setEmployeeSearch(term) {
    this.state.employeeSearch = term;
    this.state.employeeCurrentPage = 1; // Reset page on search
  },

  setEmployeeRowsPerPage(count) {
    this.state.employeeRowsPerPage = count;
    this.state.employeeCurrentPage = 1; // Reset page on rows per page change
  },

  setServiceSearch(term) {
    this.state.serviceSearch = term;
  },
};

export default employeesInContract;
