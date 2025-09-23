<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useForm } from '@/components/new_form_builder/useForm';
import Form from '@/components/new_form_builder/Form.vue';
import Button from '@/components/Button.vue';
import ModalFormSubmitButton from '@/components/new_form_builder/ModalFormSubmitButton.vue';
import { getPayersWithContractForLoggedInProvider } from '@/features/instution_settings/api/institutionSettingsApi';
import { useAuthStore } from '@/stores/auth';
import { openModal } from "@customizer/modal-x";
import { toasted } from "@/utils/utils";
import Spinner from '@/components/pageSpinner.vue';
import Select from '@/components/new_form_elements/Select.vue';
import Input from '@/components/new_form_elements/Input.vue';
import { getEligibleServicesAndDrugs, getInstitutionsByContractUuid, getInsuredEligibility, getEligibleCategoriesFromInsurance, getActivePackageCategories, getEligibleServicesFromInsurance, getEligibleServicesByCategory } from '../api/creditServicesApi';
import selectServices from '../components/selectServices.vue';
import EmployeeDetails from '../components/EmployeeDetails.vue';
import { getPayerContractById } from '@/features/provider_contract/active_provider_contracts/api/providerContractApi';
import { debounce } from '@/utils/debounce';

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({})
  },
  isEdit: {
    type: Boolean,
    default: false
  },
  pending: {
    type: Boolean,
    default: false
  },
  onSubmit: {
    type: Function,
    required: true
  },
  onCancel: {
    type: Function,
    required: true
  }
});

// Reactive state
const payers = ref([]);
const employees = ref([]);
const institutions = ref([]);
const selectedPayer = ref(null);
const selectedEmployee = ref(null);
const selectedContract = ref(null);
const selectedInstitution = ref(null);
const searchEmployeeQuery = ref('');
const fetchPending = ref(false);
const error = ref(null);
const activeTab = ref('select');
const serviceSubTab = ref('services');
const addedServices = ref([]);
const addedDrugs = ref([]);
const primaryDiagnosis = ref('');
const secondaryDiagnosis = ref('');
const auth = useAuthStore();
const providerUuid = ref(auth.auth?.user?.providerUuid || '');
const prescriptionNumber = ref('');
const pharmacyTransactionId = ref('');
const dispensingDate = ref(new Date().toISOString().split('T')[0]);
const remarks = ref({});
const selectServicesRef = ref(null);
const medicalServiceFiles = ref([]);
const attachmentFile = ref(null);
const payerSearchTerm = ref('');
const showPayerDropdown = ref(false);
const availableContracts = ref([]);
const availableInstitutions = ref([]);



function handleAttachmentFile(event) {
  const file = event.target.files[0];
  attachmentFile.value = file || null;
}

const isInsurancePayer = computed(() => {
  if (!selectedPayer.value) return false;
  const payer = payers.value.find(p => p.payerUuid === selectedPayer.value);
  return payer?.insurance === true;
});

const medicalServicePreviews = ref([]); // Array of { name, type, preview }





function handleFileDragOver(event) {
  event.preventDefault();
  event.currentTarget.classList.add('border-primary');
}
const employeeDetails = computed(() => {
  if (!selectedEmployee.value) return null;
  return {
    fullName: selectedEmployee.value.fullName,
    employeeId: selectedEmployee.value.membershipNumber || selectedEmployee.value.idNumber,
    role: selectedEmployee.value.position,
    phone: selectedEmployee.value.phone || selectedEmployee.value.insuredPhone,
    insuredUuid: selectedEmployee.value.insuredUuid,
    email: selectedEmployee.value.email || 'N/A',
    gender: selectedEmployee.value.gender || 'Unknown',
    address: selectedEmployee.value.address || 'Unknown',
    idNumber: selectedEmployee.value.membershipNumber || selectedEmployee.value.idNumber,
    birthDate: selectedEmployee.value.birthDate || 'Unknown',
    status: selectedEmployee.value.status || 'ACTIVE',
    profilePicture: selectedEmployee.value.profilePictureBase64,
    isDependant: selectedEmployee.value.isDependant || false,
    relationshipType: selectedEmployee.value.relationshipType || '',
    employeeUuid: selectedEmployee.value.employeeUuid || ''
  };
});

const payerOptions = computed(() => {
  return payers.value.map(payer => ({
    label: `${payer.payerName} ${payer.insurance ? '(Insurance)' : ''} (${payer.telephone || payer.email || 'N/A'})`,
    value: payer.payerUuid,
  }));
});

// Filtered payer options with search
const filteredPayerOptions = computed(() => {
  if (!payerSearchTerm.value) return payerOptions.value;

  return payerOptions.value.filter((option) =>
    option.label.toLowerCase().includes(payerSearchTerm.value.toLowerCase())
  );
});

function selectPayer(option) {
  selectedPayer.value = option.value;
  payerSearchTerm.value = option.label;
  showPayerDropdown.value = false;
}

function handlePayerInputFocus() {
  showPayerDropdown.value = true;
}

function handlePayerInputBlur() {
  // Delay hiding to allow click events on dropdown items
  setTimeout(() => {
    showPayerDropdown.value = false;
  }, 200);
}

function clearPayerSearch() {
  payerSearchTerm.value = '';
  selectedPayer.value = '';
  showPayerDropdown.value = false;
}

const contractOptions = computed(() => {
  if (!selectedPayer.value) return [];
  const payer = payers.value.find(p => p.payerUuid === selectedPayer.value);
  if (!payer || !payer.contracts) return [];

  return payer.contracts.map(contract => ({
    label: contract.contractName,
    value: contract.contractHeaderUuid
  }));
});

const institutionOptions = computed(() => {
  return institutions.value.map(institution => ({
    label: institution.name,
    value: institution.uuid
  }));
});

async function fetchPayers() {
  try {
    fetchPending.value = true;
    error.value = null;
    const response = await getPayersWithContractForLoggedInProvider({ page: 1,size:10000 });

    if (!response?.data?.content || !Array.isArray(response.data.content)) {
      throw new Error('Invalid data format: missing content array');
    }

    payers.value = response.data.content.map(item => ({
      payerUuid: item.payerUuid,
      payerName: item.payerName || `Unnamed Payer (${item.email})`,
      email: item.email,
      telephone: item.telephone,
      contracts: item.contracts || [],
      insurance: item.insurance || false
    }));

    if (payers.value.length === 0) {
      error.value = 'No payers available';
    }
  } catch (err) {
    console.error('Error fetching payers:', err);
    error.value = {
      message: 'Failed to load payers. Please try again.',
      action: fetchPayers
    };
  } finally {
    fetchPending.value = false;
  }
}

async function fetchInstitutions() {
  if (!selectedContract.value) return;

  try {
    fetchPending.value = true;
    error.value = null;

    const response = await getInstitutionsByContractUuid(selectedContract.value);

    if (!response.success || !Array.isArray(response.data)) {
      throw new Error(response.error || 'Invalid institutions data format');
    }

    institutions.value = response.data.map(institution => ({
      uuid: institution.uuid,
      name: institution.name
    }));

    if (institutions.value.length === 0) {
      error.value = 'No institutions available for this contract';
    }
  } catch (err) {
    console.error('Error fetching institutions:', err);
    error.value = {
      message: err.message || 'Failed to load institutions. Please try again.',
      action: fetchInstitutions
    };
    institutions.value = [];
  } finally {
    fetchPending.value = false;
  }
}

async function fetchEmployees() {
  if (!selectedPayer.value || !selectedContract.value) return;

  try {
    fetchPending.value = true;
    error.value = null;
    const searchTerm = searchEmployeeQuery.value.trim();

    if (isInsurancePayer.value) {
      if (!selectedInstitution.value) {
        error.value = 'Please select an institution first';
        return;
      }

      const response = await getInsuredEligibility(
        selectedContract.value,
        selectedInstitution.value,
        searchTerm
      );

      if (!Array.isArray(response.data)) {
        throw new Error('Invalid employee data format from eligibility API');
      }

      employees.value = response.data.map(employee => ({
        insuredUuid: employee.insuredUuid,
        fullName: `${employee.firstName || ''} ${employee.fatherName || ''} ${employee.grandFatherName || ''}`.trim(),
        firstName: employee.firstName,
        fatherName: employee.fatherName,
        grandFatherName: employee.grandFatherName,
        idNumber: employee.idNumber,
        insuranceId: employee.insuranceId,
        insuredPhone: employee.insuredPhone,
        email: employee.email,
        birthDate: employee.birthDate,
        gender: employee.gender,
        status: employee.status,
        position: employee.position || 'Employee',
        institutionName: employee.institutionName,
        payerName: employee.payerName,
        membershipNumber: employee.idNumber,
        phone: employee.insuredPhone,
        eligible: true,
        isDependant: false,
        dependants: []
      }));

    } else {
      const response = await getPayerContractById(
        selectedContract.value,
        searchTerm
      );

      if (!response?.data?.insuredSummaries) {
        throw new Error('Invalid employee data format: insuredSummaries not found');
      }

      employees.value = response.data.insuredSummaries.flatMap(employee => {
        const employeeRecord = {
          insuredUuid: employee.insuredUuid,
          fullName: employee.fullName,
          membershipNumber: employee.membershipNumber || 'N/A',
          phone: '',
          email: '',
          gender: '',
          address: '',
          eligible: true,
          position: 'Employee',
          idNumber: employee.membershipNumber || 'N/A',
          birthDate: '',
          profilePictureBase64: null,
          status: 'ACTIVE',
          isDependant: false,
          dependants: employee.dependants || []
        };

        const dependantRecords = (employee.dependants || []).map(dependant => ({
          insuredUuid: dependant.dependantUuid,
          fullName: dependant.fullName,
          phone: '',
          email: '',
          gender: '',
          address: '',
          eligible: true,
          position: `Dependant (${dependant.relationshipType})`,
          idNumber: 'N/A',
          birthDate: '',
          profilePictureBase64: null,
          status: 'ACTIVE',
          isDependant: true,
          employeeId: employee.membershipNumber || 'N/A',
          relationshipType: dependant.relationshipType,
          employeeUuid: employee.insuredUuid
        }));

        return [employeeRecord, ...dependantRecords];
      });
    }

    if (employees.value.length === 0) {
      error.value = searchTerm
        ? 'No matching employees found'
        : (isInsurancePayer.value
          ? 'No employees found for this institution'
          : 'No employees found for this contract');
    }
  } catch (err) {
    console.error('Error fetching employees:', err);
    error.value = {
      message: `Failed to load employees: ${err.message}`,
      action: fetchEmployees
    };
    employees.value = [];
  } finally {
    fetchPending.value = false;
  }
}

const debouncedFetch = debounce(fetchEmployees, 300);

watch(searchEmployeeQuery, () => {
  debouncedFetch();
});

watch(selectedInstitution, () => {
  if (isInsurancePayer.value) {
    fetchEmployees();
  }
});

function selectEmployee(employee) {
  selectedEmployee.value = {
    ...employee,
    isDependant: employee.isDependant || false,
    employeeUuid: employee.isDependant ? employee.employeeUuid : employee.insuredUuid,
    dependantUuid: employee.isDependant ? employee.insuredUuid : null
  };
  activeTab.value = 'details';
}

function goToSelect() {
  activeTab.value = 'select';
}

function goToDetails() {
  if (selectedEmployee.value) {
    activeTab.value = 'details';
  }
}

function goToServices() {
  if (selectedEmployee.value) {
    activeTab.value = 'services';
    serviceSubTab.value = 'services';
  }
}
const setSearchResults = (results, packageResponse = null) => {
  if (packageResponse) {
    searchResults.value = packageResponse;
  } else {
    searchResults.value = results;
  }
};

const setAvailablePackages = (packages) => {
  availablePackages.value = packages;
};

const setAvailableCategories = (categories) => {
  availableCategories.value = categories;
};

// Expose these methods to parent component
defineExpose({
  setSearchResults,
  setAvailablePackages,
  setAvailableCategories,
  getFormState,
  submit: handleSubmit
});


function handleUpdateRemarks(newRemarks) {
  remarks.value = newRemarks;
}

function handleAddItem(item) {
  console.log('handleAddItem received:', item);

  // Normalize and preserve identifiers across insurance and non-insurance flows.
  const normalizedServiceId = item.serviceId ?? item.serviceUuid ?? item.serviceCode ?? null;
  const normalizedContractDetailUuid = item.contractDetailUuid ?? item.contractDetailId ?? null;
  const normalizedId = item.id ?? normalizedContractDetailUuid ?? normalizedServiceId ?? null;

  const quantity = item.quantity ?? 1;
  const price = item.price ?? 0;

  const processedItem = {
    ...item,
    // stable id - prefer explicit id, then contract detail uuid, then service id if present
    id: normalizedId,
    // always keep contractDetailUuid if present
    contractDetailUuid: normalizedContractDetailUuid,
    // ALWAYS preserve serviceId when available (do not set to undefined)
    serviceId: normalizedServiceId,
    // ensure sensible defaults
    quantity,
    price,
    totalCost: price * quantity,
    fsNumber: item.fsNumber ?? 'N/A',
    // carry through diagnosis if provided or fallback to current form values
    primaryDiagnosis: item.primaryDiagnosis ?? primaryDiagnosis.value ?? '',
    secondaryDiagnosis: item.secondaryDiagnosis ?? secondaryDiagnosis.value ?? ''
  };

  if (serviceSubTab.value === 'services') {
    addedServices.value.push(processedItem);
  } else {
    addedDrugs.value.push(processedItem);
  }

  console.log('Item added to list:', processedItem);
}
function handleRemoveItem(index) {
  if (serviceSubTab.value === 'services') {
    addedServices.value.splice(index, 1);
  } else {
    addedDrugs.value.splice(index, 1);
  }
}

function handleUpdateQuantity({ index, value }) {
  if (serviceSubTab.value === 'services') {
    addedServices.value[index].quantity = value;
  } else {
    addedDrugs.value[index].quantity = value;
  }
}

function handleUpdateDiagnosis({ index, primaryDiagnosis: primary, secondaryDiagnosis: secondary }) {
  if (primary !== undefined) {
    addedServices.value[index].primaryDiagnosis = primary;
  }
  if (secondary !== undefined) {
    addedServices.value[index].secondaryDiagnosis = secondary;
  }
}

function handleUpdateItem({ index, item }) {
  if (serviceSubTab.value === 'drugs') {
    addedDrugs.value[index] = { ...addedDrugs.value[index], ...item };
  }
}

function handleClearItems(tab) {
  if (tab === 'services') {
    addedServices.value = [];
  } else {
    addedDrugs.value = [];
  }
}

function validateForm() {
  if (!selectedPayer.value || !selectedContract.value || !selectedEmployee.value || !dispensingDate.value) {
    error.value = 'Please fill all required fields';
    return false;
  }

  const hasItems = addedServices.value.length > 0 || addedDrugs.value.length > 0;
  if (!hasItems) {
    error.value = 'Please add at least one service or drug';
    return false;
  }

  const invalidDrug = addedDrugs.value.some(item =>
    (!item.route || !item.frequency || !item.dose || !item.duration)
  );

  if (invalidDrug) {
    error.value = 'Please fill all drug administration details';
    return false;
  }

  return true;
}

const isDragOver = ref(false);

// Enhanced file handling functions


function handleFileDragLeave(event) {
  event.preventDefault();
  // Only remove drag-over state if leaving the actual drop zone
  const rect = event.currentTarget.getBoundingClientRect();
  if (
    event.clientX <= rect.left || 
    event.clientX >= rect.right ||
    event.clientY <= rect.top || 
    event.clientY >= rect.bottom
  ) {
    isDragOver.value = false;
  }
}

function handleFileDrop(event) {
  event.preventDefault();
  isDragOver.value = false;
  
  const files = Array.from(event.dataTransfer?.files || []);
  if (files.length > 0) {
    processMedicalFiles(files);
  }
}

function handleMedicalServiceFiles(event) {
  const files = Array.from(event.target.files || []);
  if (files.length > 0) {
    processMedicalFiles(files);
    // Reset the input to allow selecting the same file again
    event.target.value = '';
  }
}

function processMedicalFiles(files) {
  const validFiles = files.filter(file => {
    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toasted(false, "File Too Large", `${file.name} exceeds 5MB limit`);
      return false;
    }
    
    // Check file type
    const validTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!validTypes.includes(file.type)) {
      toasted(false, "Invalid File Type", `${file.name} is not a supported format`);
      return false;
    }
    
    return true;
  });
  
  if (validFiles.length === 0) return;
  
  // Process each valid file
  validFiles.forEach(file => {
    const filePreview = { 
      name: file.name, 
      type: file.type, 
      file: file, // Store the actual file object
      preview: '' 
    };
    
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        filePreview.preview = e.target?.result || '';
        medicalServicePreviews.value.push(filePreview);
      };
      reader.onerror = () => {
        // If image preview fails, still add the file without preview
        medicalServicePreviews.value.push(filePreview);
      };
      reader.readAsDataURL(file);
    } else {
      // For non-image files, add directly
      medicalServicePreviews.value.push(filePreview);
    }
  });
}

function removeFile(index) {
  medicalServicePreviews.value.splice(index, 1);
}

function getFileTypeIcon(fileType) {
  if (fileType.startsWith('image/')) return '🖼️ Image';
  if (fileType === 'application/pdf') return '📄 PDF';
  if (fileType.includes('word')) return '📝 Document';
  if (fileType.includes('excel') || fileType.includes('sheet')) return '📊 Spreadsheet';
  return '📁 File';
}

// Add this method to expose form state
function getFormState() {
  return {
    selectedContract: selectedContract.value,
    selectedEmployee: selectedEmployee.value,
    primaryDiagnosis: primaryDiagnosis.value,
    secondaryDiagnosis: secondaryDiagnosis.value,
    isInsurancePayer: isInsurancePayer.value,
    selectedPackage: selectedPackage.value,
    dispensingDate: dispensingDate.value,
    addedServices: [...addedServices.value],
    addedDrugs: [...addedDrugs.value],
    // Return actual File objects collected via previews so parent can append them
    attachmentFile: attachmentFile.value,
    medicalServiceFiles: medicalServicePreviews.value.map(p => p.file || null).filter(Boolean)
  };
}

function triggerMedicalFileBrowse() {
  const input = document.getElementById('medical-service-file-upload');
  if (input) input.click();
}

// Update your form submission to delegate FormData building to the parent
function handleSubmit() {
  if (!selectedEmployee.value) {
    toasted.error('No employee selected');
    return;
  }

  // 🔹 Debugging: log everything in a readable format (keep helpful info for parent)
  const medicationItems = [
    ...addedServices.value.map(item => ({
      itemType: 'SERVICE',
      remark: item.remark || '',
      price: item.price || 0,
      quantity: item.quantity || 1,
      contractDetailUuid: item.contractDetailUuid,
      ...(isInsurancePayer.value && { serviceId: item.serviceId })
    })),
    ...addedDrugs.value.map(item => ({
      itemType: 'DRUG',
      remark: item.remark || '',
      price: item.price || 0,
      quantity: item.quantity || 1,
      route: item.route || 'oral',
      frequency: item.frequency || 'daily',
      dose: item.dose || '1',
      duration: item.duration || '7 days',
      contractDetailUuid: item.contractDetailUuid,
      ...(isInsurancePayer.value && { serviceId: item.serviceId })
    }))
  ];

  console.log('--- Form Submission Debug ---');
  console.log('Selected Contract:', selectedContract.value);
  console.log('Selected Employee:', selectedEmployee.value);
  console.log('Primary Diagnosis:', primaryDiagnosis.value);
  console.log('Secondary Diagnosis:', secondaryDiagnosis.value);
  console.log('Is Insurance Payer:', isInsurancePayer.value);
  console.log('Selected Package:', selectedPackage.value);
  console.log('Dispensing Date:', dispensingDate.value);
  console.log('Added Services:', addedServices.value);
  console.log('Added Drugs:', addedDrugs.value);
  console.log('Medication Items JSON:', JSON.stringify(medicationItems, null, 2));
  console.log('Files:', medicalServicePreviews.value.map(f => f.name));
  console.log('--- End Debug ---');

  // Delegate to parent: call the provided onSubmit handler without passing the child's FormData.
  // Parent will call getFormState() and build the correct "request" + "attachment" multipart form.
  props.onSubmit();
}
  
onMounted(async () => {
  await fetchPayers();
});

watch(selectedPayer, async (newPayerId) => {
  selectedContract.value = null;
  selectedInstitution.value = null;
  selectedEmployee.value = null;
  institutions.value = [];
  employees.value = [];
  error.value = null;

  if (!newPayerId) return;

  const payer = payers.value.find(p => p.payerUuid === newPayerId);
  if (payer?.contracts?.length === 1) {
    selectedContract.value = payer.contracts[0].contractHeaderUuid;

    if (isInsurancePayer.value) {
      await fetchInstitutions();
    } else {
      await fetchEmployees();
    }
  }
});

watch(selectedContract, async (newContractId) => {
  selectedInstitution.value = null;
  selectedEmployee.value = null;
  institutions.value = [];
  employees.value = [];
  error.value = null;

  if (!newContractId) return;

  if (isInsurancePayer.value) {
    await fetchInstitutions();
  } else {
    await fetchEmployees();
  }
});

watch(selectedInstitution, async (newInstitution) => {
  selectedEmployee.value = null;
  employees.value = [];
  error.value = null;

  if (newInstitution && isInsurancePayer.value) {
    await fetchEmployees();
  }
});

let searchTimeout;
watch(searchEmployeeQuery, (newQuery) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    if (selectedPayer.value && selectedContract.value) {
      if (isInsurancePayer.value && selectedInstitution.value) {
        await fetchEmployees();
      } else if (!isInsurancePayer.value) {
        await fetchEmployees();
      }
    }
  }, 500);
});

watch(serviceSubTab, (newTab) => {
  console.log('Service sub-tab changed to:', newTab);
});

watch([addedServices, addedDrugs], () => {
  console.log('Services:', addedServices.value);
  console.log('Drugs:', addedDrugs.value);
}, { deep: true });

// Add new reactive state for categories and packages
const categories = ref([]);
const packages = ref([]);
const selectedCategory = ref(null);
const selectedPackage = ref(null);

// Add computed property to check if payer is insurance

// Add function to fetch categories/packages
async function fetchCategoriesOrPackages() {
  if (!selectedEmployee.value) return;

  try {
    fetchPending.value = true;
    error.value = null;

    if (isInsurancePayer.value) {
      // For insurance payers, fetch eligible categories
      const response = await getEligibleCategoriesFromInsurance(selectedEmployee.value.insuredUuid);
      packages.value = response.data.map(pkg => ({
        packageUuid: pkg.packageUuid,
        packageName: pkg.packageName,
        sumAssured: pkg.sumAssured
      }));
    } else {
      // For non-insurance payers, fetch active package categories
      const response = await getActivePackageCategories({ payerUuid: selectedPayer.value });
      categories.value = response.data.content.map(category => ({
        categoryUuid: category.categoryUuid,
        categoryName: category.categoryName,
        categoryCode: category.categoryCode,
        description: category.description,
        totalServices: category.totalServices
      }));
    }
  } catch (err) {
    console.error('Error fetching categories/packages:', err);
    error.value = `Failed to load ${isInsurancePayer.value ? 'packages' : 'categories'}: ${err.message}`;
  } finally {
    fetchPending.value = false;
  }
}

// Add computed options for categories and packages
const categoryOptions = computed(() => {
  return categories.value.map(category => ({
    label: `${category.categoryName} (${category.totalServices} services)`,
    value: category.categoryUuid
  }));
});

const packageOptions = computed(() => {
  return packages.value.map(pkg => ({
    label: `${pkg.packageName} - ETB ${pkg.sumAssured}`,
    value: pkg.packageUuid
  }));
});

// Watch for employee selection to fetch categories/packages
watch(selectedEmployee, async (newEmployee) => {
  if (newEmployee) {
    await fetchCategoriesOrPackages();
  }
});

// Watch for category/package selection
watch([selectedCategory, selectedPackage], () => {
  // Clear search results when category/package changes
  if (selectServicesRef.value) {
    selectServicesRef.value.setSearchResults([]);
  }
});
watch(packages, (newPackages) => {
  console.log('Packages updated:', newPackages);
  if (selectServicesRef.value && selectServicesRef.value.setAvailablePackages) {
    selectServicesRef.value.setAvailablePackages(newPackages);
  } else {
    console.error('selectServicesRef.value.setAvailablePackages not available');
  }
});

watch(categories, (newCategories) => {
  console.log('Categories updated:', newCategories);
  if (selectServicesRef.value && selectServicesRef.value.setAvailableCategories) {
    selectServicesRef.value.setAvailableCategories(newCategories);
  } else {
    console.error('selectServicesRef.value.setAvailableCategories not available');
  }
});

// Update the handleSearchItems function with better debugging
async function handleSearchItems({ type, query, searchType, insuredUuid, contractHeaderUuid, selectedCategory, selectedPackage, isInsurance }) {
  try {
    fetchPending.value = true;
    console.log('handleSearchItems called with:', { type, query, searchType, selectedCategory, selectedPackage, isInsurance });
    console.log('selectServicesRef.value:', selectServicesRef.value);

    let response;
    
    if (isInsurance && selectedPackage) {
      console.log('Fetching insurance package services...');
      response = await getEligibleServicesFromInsurance(
        selectedContract.value,
        selectedPackage,
        selectedEmployee.value.insuredUuid,
        query ? { search: query } : {}
      );
      
      console.log('Insurance package response:', response.data);
      
      if (selectServicesRef.value && selectServicesRef.value.setSearchResults) {
        selectServicesRef.value.setSearchResults([], response.data);
      } else {
        console.error('selectServicesRef.value.setSearchResults not available');
      }
    } else if (!isInsurance && selectedCategory) {
      console.log('Fetching category services...');
      response = await getEligibleServicesByCategory(
        selectedContract.value,
        selectedCategory,
        query || ''
      );

      console.log('Category response:', response.data);
      console.log('Category response content:', response.data?.content);
      
      const items = response.data?.content || [];
      if (selectServicesRef.value && selectServicesRef.value.setSearchResults) {
        console.log('Calling setSearchResults with items:', items);
        selectServicesRef.value.setSearchResults(items);
      } else {
        console.error('selectServicesRef.value.setSearchResults not available');
      }
    } else {
      console.warn('No category or package selected for service search');
      if (selectServicesRef.value && selectServicesRef.value.setSearchResults) {
        selectServicesRef.value.setSearchResults([]);
      }
    }
  } catch (error) {
    console.error('Error searching items:', error);
    if (selectServicesRef.value && selectServicesRef.value.setSearchResults) {
      selectServicesRef.value.setSearchResults([]);
    }
  } finally {
    fetchPending.value = false;
  }
}
  
</script>

<template>
  <Form ref="formEl" :inner="false" v-slot="{ }" id="credit-service-form" class="bg-white rounded-lg shadow-sm"
    @submit.prevent="handleSubmit">
    <!-- Navigation Tabs with Integrated Title -->
    <div class="border-b border-gray-200 px-6">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-medium text-gray-900">
          <template v-if="activeTab === 'select'">Eligibility Check</template>
          <template v-else-if="activeTab === 'details'">Employee Details</template>
          <template v-else-if="activeTab === 'services'">
            Credit Services for {{ employeeDetails?.fullName || 'Selected Employee' }}
          </template>
        </h2>

        <nav class="-mb-px flex space-x-8">
          <button type="button" @click="goToSelect" :class="{
            'border-primary text-primary font-bold': activeTab === 'select',
            'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium': activeTab !== 'select'
          }" class="whitespace-nowrap py-4 px-1 border-b-2 text-sm">
            Eligibility Check
            <span v-if="selectedEmployee" class="ml-1 bg-primary text-white text-xs px-2 py-0.5 rounded-full">✓</span>
          </button>

          <button type="button" @click="goToDetails" :disabled="!selectedEmployee" :class="{
            'border-primary text-primary font-bold': activeTab === 'details',
            'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium': activeTab !== 'details',
            'opacity-50 cursor-not-allowed': !selectedEmployee
          }" class="whitespace-nowrap py-4 px-1 border-b-2 text-sm">
            Employee Details
          </button>

          <button type="button" @click="goToServices" :disabled="!selectedEmployee" :class="{
            'border-primary text-primary font-bold': activeTab === 'services',
            'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium': activeTab !== 'services',
            'opacity-50 cursor-not-allowed': !selectedEmployee
          }" class="whitespace-nowrap py-4 px-1 border-b-2 text-sm">
            Credit Services
            <span v-if="addedServices.length > 0 || addedDrugs.length > 0"
              class="ml-1 bg-primary text-white text-xs px-2 py-0.5 rounded-full">
              {{ addedServices.length + addedDrugs.length }}
            </span>
          </button>
        </nav>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="p-6">
      <!-- Select Employee Tab -->
      <div v-if="activeTab === 'select'" class="space-y-6">
        <!-- Enhanced Error Message with Try Again -->
        <div v-if="error" class="p-4 mb-4 rounded-lg flex items-start justify-between"
          :class="typeof error === 'object' ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'">
          <div class="flex items-start">
            <svg v-if="typeof error === 'object'" class="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" fill="none"
              stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z">
              </path>
            </svg>
            <svg v-else class="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <h3 class="font-medium" :class="typeof error === 'object' ? 'text-red-800' : 'text-blue-800'">
                {{ typeof error === 'object' ? error.message : error }}
              </h3>
              <div class="mt-1 text-sm" :class="typeof error === 'object' ? 'text-red-700' : 'text-blue-700'">
                <p v-if="typeof error === 'object'">Please check your network connection and try again.</p>
              </div>
            </div>
          </div>
          <button v-if="typeof error === 'object' && error.action" @click="error.action()"
            class="ml-4 px-3 py-1 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            Try Again
          </button>
        </div>

        <!-- Search and Filter Section (Always Visible) -->
        <div class="bg-gradient-to-r from-blue-100 to-gray-50 p-4 rounded-lg border border-gray-200">
          <div class="flex flex-wrap gap-4">
            <div class="w-full md:w-72">
              <label class="block text-sm font-medium text-gray-700 mb-2">Select Payer</label>
              <div class="relative">
                <div class="relative">
                  <input
                    v-model="payerSearchTerm"
                    type="text"
                    placeholder="Search payers..."
                    @focus="handlePayerInputFocus"
                    @blur="handlePayerInputBlur"
                    class="w-48 px-3 py-4 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white"
                  />
                  <button
                    v-if="payerSearchTerm"
                    @click="clearPayerSearch"
                    class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                
                <div 
                  v-if="showPayerDropdown && filteredPayerOptions.length > 0"
                  class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                >
                  <div
                    v-for="option in filteredPayerOptions"
                    :key="option.value"
                    @mousedown.prevent="selectPayer(option)"
                    class="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0 transition-colors"
                    :class="{ 'bg-blue-100': selectedPayer === option.value }"
                  >
                    <div class="font-medium text-gray-900">{{ option.label }}</div>
                    <div class="text-xs text-gray-500 mt-1">{{ option.email || 'No email' }}</div>
                  </div>
                </div>
                
                <div 
                  v-else-if="showPayerDropdown && payerSearchTerm && filteredPayerOptions.length === 0"
                  class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-3"
                >
                  <div class="text-sm text-gray-500 text-center">
                    <svg class="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    No payers found matching "{{ payerSearchTerm }}"
                  </div>
                </div>
              </div>
            </div>

            <div class="w-full md:w-72">
              <Select
                :obj="true"
                name="contract"
                label="Select Contract"
                validation="required"
                :options="contractOptions"
                :attributes="{ placeholder: 'Select a Contract' }"
                v-model="selectedContract"
              />
            </div>

            <div class="w-full md:w-72" v-if=" isInsurancePayer">
              <Select
                :obj="true"
                name="institution"
                label="Select Institution"
                validation="required"
                :options="institutionOptions"
                :disabled="fetchPending || !selectedContract"
                :attributes="{ placeholder: 'Select an Institution' }"
                v-model="selectedInstitution"
              />
            </div>
            
            <div class="w-full md:flex-1">
              <Input
                name="searchEmployeeQuery"
                label="Search Employees"
                :attributes="{ placeholder: 'Search by name, ID, or insurance number' }"
                v-model="searchEmployeeQuery"
              >
                <template #suffix>
                  <Spinner v-if="fetchPending" class="ml-2" />
                  <svg v-else class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </template>
              </Input>
            </div>
          </div>
        </div>

        <!-- Results Summary Card -->
        <div v-if="!fetchPending && employees.length > 0"
          class="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="p-2 bg-blue-100 rounded-full">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z">
                  </path>
                </svg>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-900">
                 Top {{ employees.length }} {{ employees.length === 1 ? 'employee' : 'employees' }} 
                </h3>
                <p class="text-xs text-gray-500">
                  {{ searchEmployeeQuery ? `Filtered by: "${searchEmployeeQuery}"` : 'Showing  eligible employees' }}
                </p>
              </div>
            </div>
            <button v-if="searchEmployeeQuery" @click="searchEmployeeQuery = ''"
              class="text-xs text-blue-600 hover:text-blue-800 flex items-center">
              Clear search
              <svg class="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <template v-if="fetchPending">
          <div class="flex flex-col items-center justify-center py-12 space-y-4">
            <div class="relative">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <div class="absolute inset-0 rounded-full h-12 w-12 border-t-2 border-blue-200 animate-pulse"></div>
            </div>
            <div class="text-center">
              <p class="text-lg font-medium text-gray-700">
                {{ isInsurancePayer ? 'Loading insured members...' : 'Loading employees...' }}
              </p>
              <p class="text-sm text-gray-500 animate-pulse">
                {{ searchEmployeeQuery ? 'Searching for matching records' : 'Fetching eligible members' }}
              </p>
            </div>
          </div>
        </template>

        <!-- Enhanced Table (Always Visible) -->
        <div class="border rounded-xl flex-1 flex flex-col overflow-hidden shadow-sm bg-white">
          <div class="overflow-auto" style="max-height: calc(100vh - 350px); min-height: 300px;">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
                <tr>
                  <th
                    class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    <div class="flex items-center space-x-1">
                      <span>#</span>
                      <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path>
                      </svg>
                    </div>
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    <div class="flex items-center space-x-1">
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-4 0H9m4 0h1m-5 8l2 2 4-4">
                        </path>
                      </svg>
                      <span>Employee ID</span>
                    </div>
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    <div class="flex items-center space-x-1">
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                      <span>Patient Name</span>
                    </div>
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    <div class="flex items-center space-x-1">
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4">
                        </path>
                      </svg>
                      <span>Type</span>
                    </div>
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    <div class="flex items-center space-x-1">
                      <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span>Eligibility</span>
                    </div>
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    <div class="flex items-center space-x-1">
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                      </svg>
                      <span>Action</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-100">
                <template v-if="employees.length > 0">
                  <template v-for="(employee, index) in employees" :key="employee.insuredUuid">
                    <!-- Main employee row with enhanced styling -->
                    <tr v-if="!employee.isDependant" :class="{
                      'bg-gradient-to-r from-teal-50 to-cyan-50 border-l-4 border-teal-400': selectedEmployee && selectedEmployee.insuredUuid === employee.insuredUuid,
                      'hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-200': !(selectedEmployee && selectedEmployee.insuredUuid === employee.insuredUuid),
                      'border-b-2 border-blue-200': employee.dependants && employee.dependants.length > 0
                    }" class="group cursor-pointer">
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div
                          class="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-blue-600 font-semibold group-hover:bg-blue-200 transition-colors">
                          {{ index + 1 }}
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div class="flex items-center space-x-2">
                          <div class="flex-shrink-0 w-2 h-2 bg-green-400 rounded-full"></div>
                          <span>{{ employee.membershipNumber || employee.idNumber }}</span>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div class="flex items-center space-x-3">
                          <div
                            class="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                            {{ employee.fullName.charAt(0).toUpperCase() }}
                          </div>
                          <span class="font-medium text-gray-900">{{ employee.fullName }}</span>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span
                          class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300">
                          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6">
                            </path>
                          </svg>
                          Employee
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-200 text-green-800 border border-green-300">
                          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          Eligible
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button type="button" @click="selectEmployee(employee)" :class="{
                          'bg-gradient-to-r from-primary to-teal-600 text-white shadow-lg transform scale-105':
                            selectedEmployee && selectedEmployee.insuredUuid === employee.insuredUuid,
                          'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-primary hover:to-teal-600 hover:text-white hover:shadow-md transform hover:scale-105':
                            !(selectedEmployee && selectedEmployee.insuredUuid === employee.insuredUuid)
                        }"
                          class="px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2">
                          <svg v-if="selectedEmployee && selectedEmployee.insuredUuid === employee.insuredUuid"
                            class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7">
                            </path>
                          </svg>
                          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                          </svg>
                          <span>{{ selectedEmployee && selectedEmployee.insuredUuid === employee.insuredUuid ?
                            'Detail' : 'Detail' }}</span>
                        </button>
                      </td>
                    </tr>

                    <!-- Enhanced Dependants rows -->
                    <template
                      v-if="!employee.isDependant && employee.dependants && employee.dependants.length > 0 && !isInsurancePayer">
                      <tr v-for="(dependant, dIndex) in employee.dependants" :key="dependant.dependantUuid" :class="{
                        'bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-400': selectedEmployee && selectedEmployee.insuredUuid === dependant.dependantUuid,
                        'bg-gradient-to-r from-blue-25 to-indigo-25 hover:from-blue-50 hover:to-indigo-50': !(selectedEmployee && selectedEmployee.insuredUuid === dependant.dependantUuid)
                      }" class="group cursor-pointer transition-all duration-200">
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 pl-10">
                          <div class="flex items-center space-x-2">
                            <span class="text-purple-600 font-bold">↳</span>
                            <div
                              class="flex items-center justify-center w-6 h-6 bg-purple-100 rounded-full text-purple-600 font-semibold text-xs">
                              {{ dIndex + 1 }}
                            </div>
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div class="flex items-center space-x-2">
                            <div class="flex-shrink-0 w-2 h-2 bg-purple-400 rounded-full"></div>
                            <span>{{ employee.membershipNumber }}</span>
                            <span class="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">(Employee ID)</span>
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 pl-2">
                          <div class="flex items-center space-x-3">
                            <div
                              class="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                              {{ dependant.fullName.charAt(0).toUpperCase() }}
                            </div>
                            <div class="flex flex-col">
                              <span class="font-medium text-gray-900">{{ dependant.fullName }}</span>
                              <span
                                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200">
                                {{ dependant.relationshipType }}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span
                            class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-100 to-purple-200 text-indigo-800 border border-indigo-300">
                            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z">
                              </path>
                            </svg>
                            Dependant
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-200 text-green-800 border border-green-300">
                            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            Eligible
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button type="button" @click="selectEmployee({
                            insuredUuid: dependant.dependantUuid,
                            fullName: dependant.fullName,
                            phone: employee.phone,
                            idNumber: employee.membershipNumber,
                            position: `Dependant (${dependant.relationshipType})`,
                            birthDate: '',
                            eligible: true,
                            status: 'ACTIVE',
                            gender: '',
                            email: employee.email,
                            address: employee.address,
                            isDependant: true,
                            dependantUuid: dependant.dependantUuid,
                            employeeUuid: employee.insuredUuid,
                            relationshipType: dependant.relationshipType,
                            membershipNumber: employee.membershipNumber
                          })" :class="{
                              'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg transform scale-105':
                                selectedEmployee && selectedEmployee.insuredUuid === dependant.dependantUuid,
                              'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-purple-500 hover:to-pink-600 hover:text-white hover:shadow-md transform hover:scale-105':
                                !(selectedEmployee && selectedEmployee.insuredUuid === dependant.dependantUuid)
                            }"
                            class="px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2">
                            <svg v-if="selectedEmployee && selectedEmployee.insuredUuid === dependant.dependantUuid"
                              class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7">
                              </path>
                            </svg>
                            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                            <span>{{ selectedEmployee && selectedEmployee.insuredUuid === dependant.dependantUuid ?
                              'Selected' : 'Select' }}</span>
                          </button>
                        </td>
                      </tr>
                    </template>
                  </template>
                </template>
                <template v-else>
                  <tr>
                    <td colspan="6" class="px-6 py-12 text-center">
                      <div class="flex flex-col items-center justify-center space-y-3">
                        <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
                          </path>
                        </svg>
                        <h3 class="text-lg font-medium text-gray-900">No employees found</h3>
                        <p class="text-sm text-gray-500">
                          {{ searchEmployeeQuery
                            ? 'No matching employees found for your search'
                            : (isInsurancePayer
                              ? 'No employees available for the selected institution'
                              : 'No employees available for the selected contract') }}
                        </p>
                        <button v-if="searchEmployeeQuery" @click="searchEmployeeQuery = ''"
                          class="mt-2 px-3 py-1 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                          Clear search
                        </button>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="selectedEmployee" class="pt-4 px-6 border-t border-gray-200 flex justify-end space-x-4">
          <Button type="button" @click="props.onCancel"
            class="text-gray-600 px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50" :disabled="fetchPending">
            Cancel
          </Button>
          <button type="button" class="px-6 py-2 bg-primary text-white rounded-md hover:bg-teal-700 flex items-center"
            @click="goToDetails">
            View Details
            <svg class="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Employee Details Tab -->
      <div v-else-if="activeTab === 'details' && employeeDetails" class="space-y-6">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div class="p-6">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-lg font-medium text-gray-900">Employee Details</h3>
                <p class="mt-1 text-sm text-gray-500">Review the selected employee information</p>
              </div>
              <button @click="goToSelect" class="text-gray-500 hover:text-gray-700">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <EmployeeDetails :employee="employeeDetails" class="mt-6" />

            <div class="mt-8 pt-6 border-t border-gray-200 flex justify-between">
              <Button type="button" @click="goToSelect"
                class="text-gray-600 px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                Back to Selection
              </Button>
              <button type="button"
                class="px-6 py-2 bg-primary text-white rounded-md hover:bg-teal-700 flex items-center"
                @click="goToServices">
                Continue to Credit Services
                <svg class="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Services Tab -->
      <div v-else-if="activeTab === 'services' && employeeDetails" class="space-y-6">
        <div v-if="error" class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {{ error }}
        </div>

        <!-- Services Selection Component -->
        <div>
          <selectServices 
            ref="selectServicesRef" 
            v-model:activeTab="serviceSubTab"
            :added-items="serviceSubTab === 'services' ? addedServices : addedDrugs" 
            :remarks="remarks"
            :primary-diagnosis="primaryDiagnosis" 
            :secondary-diagnosis="secondaryDiagnosis"
            :insured-uuid="selectedEmployee?.insuredUuid" 
            :contract-header-uuid="selectedContract"
            :selected-category="selectedCategory"
            :selected-package="selectedPackage"
            :is-insurance="isInsurancePayer"
            :available-packages="packages"
            :available-categories="categories"
            :fetch-pending="fetchPending"
            @update:remarks="handleUpdateRemarks" 
            @add-item="handleAddItem" 
            @remove-item="handleRemoveItem"
            @update-quantity="handleUpdateQuantity" 
            @update-diagnosis="handleUpdateDiagnosis"
            @update-item="handleUpdateItem" 
            @search-items="handleSearchItems" 
            @clear-items="handleClearItems"
            @update:primary-diagnosis="primaryDiagnosis = $event"
            @update:secondary-diagnosis="secondaryDiagnosis = $event"
            @update:selected-package="selectedPackage = $event"
            @update:selected-category="selectedCategory = $event"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
         <div class="space-y-2 mt-6">
    <label class="block text-sm font-medium text-gray-700">
      Medical Service Files
    </label>

    <div 
      @dragover.prevent="handleFileDragOver"
      @dragleave.prevent="handleFileDragLeave"
      @drop.prevent="handleFileDrop"
      class="border-[1px] bg-[#F6F7FA] border-dashed border-[#75778B] rounded-md items-center justify-center p-6 flex flex-col cursor-pointer hover:border-primary transition-colors duration-200"
      :class="{ 'border-primary': isDragOver }"
    >
      <div v-if="medicalServicePreviews.length" class="w-full grid grid-cols-2 gap-4 mb-4">
        <div v-for="(file, index) in medicalServicePreviews" :key="index" class="relative border rounded-md p-2 bg-white">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium truncate max-w-[120px]">{{ file.name }}</span>
            <button 
              type="button" 
              @click.stop="removeFile(index)"
              class="text-red-500 hover:text-red-700 text-sm font-bold"
            >
              ×
            </button>
          </div>
          
          <img 
            v-if="file.type.startsWith('image/') && file.preview"
            :src="file.preview" 
            alt="Preview"
            class="h-20 w-full object-contain mx-auto"
          />
          <div v-else class="flex items-center justify-center h-20 bg-gray-100 rounded">
            <span class="text-xs text-gray-500">{{ getFileTypeIcon(file.type) }}</span>
          </div>
        </div>
      </div>

      <div class="text-center">
        <template v-if="!medicalServicePreviews.length">
          <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <p class="text-sm text-[#75778B] mt-2">Drag your files here to upload</p>
          <p class="text-sm text-[#75778B] mt-1">or</p>
        </template>
        
        <button 
          type="button" 
          @click="triggerMedicalFileBrowse"
          class="mt-2 px-4 py-2 text-sm font-medium text-[#75778B] border border-[#75778B] rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          {{ medicalServicePreviews.length ? 'Add More Files' : 'Browse Files' }}
        </button>
        
        <p v-if="medicalServicePreviews.length" class="text-xs text-gray-500 mt-2">
          {{ medicalServicePreviews.length }} file(s) selected
        </p>
      </div>

      <input 
        id="medical-service-file-upload" 
        type="file" 
        accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx" 
        multiple 
        class="hidden" 
        @change="handleMedicalServiceFiles" 
      />
    </div>
    
    <p class="text-xs text-gray-500 mt-1">
      Supported formats: images, PDF, Word, Excel. Max file size: 5MB each.
    </p>
  </div>
          <div>
            <Input 
              v-model="dispensingDate" 
              name="dispensingDate" 
              label="Dispensing Date" 
              validation="required"
              :attributes="{
                type: 'date',
                placeholder: 'Select dispensing date',
                required: true
              }" 
            />
          </div>
        </div>

        <div class="pt-4 px-6 border-t border-gray-200 flex justify-between">
          <Button 
            type="button" 
            @click="goToDetails"
            class="text-gray-600 px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50" 
            :disabled="pending"
          >
            Back to Details
          </Button>
          <ModalFormSubmitButton 
            :pending="pending"
            :btn-text="'Submit Credit Services'"
            class="bg-primary hover:bg-teal-700 text-white px-6 py-2 rounded-md" 
            :disabled="pending || (addedServices.length === 0 && addedDrugs.length === 0)" 
          />
        </div>
      </div>
    </div>
  </Form>
</template>

<style scoped>
:deep(.form-control) {
  @apply bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-teal-500 focus:border-teal-500 block w-full p-2.5;
}

table {
  @apply min-w-full divide-y divide-gray-200;
}

th {
  @apply px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider;
}

td {
  @apply px-6 py-4 whitespace-nowrap text-sm;
}

.tab-content {
  transition: all 0.3s ease;
}

.tab-button {
  transition: all 0.2s ease;
}

.tab-button:hover {
  @apply text-teal-700 border-teal-300;
}

.tab-button:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.employee-row:hover {
  @apply bg-gray-50;
}

.dependant-row:hover {
  @apply bg-blue-50;
}
</style>
