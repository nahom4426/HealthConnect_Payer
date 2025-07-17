import { computed, provide, ref, watch } from "vue";
import { useTablePagination } from "./useTablePagination";
import { useApiRequest } from "./useApiRequest";

export function usePagination(options = {}) {
  console.log('Initializing usePagination with options:', options);
  
  const paginationOptions = ref({
    cb: (f) => f,
    store: null,
    auto: true,
    perPage: 25,
    totalElements: 0,
    cache: false,
    ...(options || {}),
  });

  const search = ref("");
  const perPage = ref(paginationOptions.value.perPage);
  const totalElements = ref(paginationOptions.value.totalElements || 0);

  const req = useApiRequest();

  const searching = ref(false);
  const searchPagination = useTablePagination(perPage.value);
  const pagination = useTablePagination(perPage.value);
function getPaginationData(next = true, current = false) {
  const data = {
    searchKey: search.value || "",
    search: search.value || "",
    page: next
      ? !current
        ? searching.value 
          ? ++searchPagination.page.value 
          : ++pagination.page.value
        : searching.value
          ? searchPagination.page.value
          : pagination.page.value
      : searching.value
        ? --searchPagination.page.value
        : --pagination.page.value,
    limit: perPage.value, // Use the current perPage value directly
  };
  
  console.log('Generated pagination data:', data);
  return data;
}
function extractPaginationData(response) {
  console.group('Extracting pagination data from response');
  console.log('Full response:', response);
  
  // First check if we have a success-wrapper response
  if (response?.success) {
    console.log('Detected success-wrapper format');
    const data = response.data;
    const elementsCount = data?.numberOfElements ?? data?.totalElements ?? 0;
    console.log(`Using ${data?.numberOfElements !== undefined ? 'numberOfElements' : 'totalElements'}:`, elementsCount);
    
    const result = {
      content: data?.content || [],
      totalElements: elementsCount,
      totalPages: data?.totalPages || 1,
      perPage: data?.size || data?.pageable?.pageSize || perPage.value
    };
    console.log('Extracted data:', result);
    console.groupEnd();
    return result;
  }
  
  // Check for direct pagination response (insured API)
  if (response?.totalElements !== undefined || response?.numberOfElements !== undefined) {
    console.log('Detected direct pagination format');
    const elementsCount = response?.numberOfElements ?? response?.totalElements ?? 0;
    console.log(`Using ${response?.numberOfElements !== undefined ? 'numberOfElements' : 'totalElements'}:`, elementsCount);
    
    const result = {
      content: response.content || [],
      totalElements: elementsCount,
      totalPages: response.totalPages || 1,
      perPage: response.size || perPage.value
    };
    console.log('Extracted data:', result);
    console.groupEnd();
    return result;
  }
  
  // Fallback for other formats
  console.log('Using fallback extraction');
  const elementsCount = response?.numberOfElements ?? response?.totalElements ?? 0;
  console.log(`Using ${response?.numberOfElements !== undefined ? 'numberOfElements' : response?.totalElements !== undefined ? 'totalElements' : 'fallback (0)'}:`, elementsCount);
  
  const result = {
    content: response?.content || [],
    totalElements: elementsCount,
    totalPages: response?.totalPages || 1,
    perPage: response?.size || response?.limit || perPage.value
  };
  console.log('Extracted data:', result);
  console.groupEnd();
  return result;
}

  function fetch(next = true, current = false, cache = false) {
    console.log(`Fetch called - next: ${next}, current: ${current}, cache: ${cache}`);
    
    if (req.pending.value) {
      console.log('Aborting fetch - request already pending');
      return;
    }
    
    if (next && pagination.done.value) {
      console.log('Aborting fetch - pagination done');
      return;
    }
    
    if (pagination.page.value >= pagination.totalPages.value) {
      console.log('Aborting fetch - page exceeds total pages');
      return;
    }

    const paginationData = getPaginationData(next, current);
    console.log('Sending request with data:', paginationData);

  req.send(
    () => paginationOptions.value.cb(paginationData),
    (res) => {
      console.group('Request completed');
      console.log('Full response:', res);
      
      const { content, totalElements: total, totalPages, perPage: pageSize } = 
        extractPaginationData(res?.data || res); // Handle both wrapped and direct responses

      if (paginationOptions.value.store) {
        console.log('Updating store with content');
        paginationOptions.value.store.set(content);
      }

      console.log('Updating pagination state:', {
        oldTotalElements: totalElements.value,
        newTotalElements: total,
        oldTotalPages: pagination.totalPages.value,
        newTotalPages: totalPages,
        oldPerPage: perPage.value,
        newPerPage: pageSize
      });

      pagination.totalPages.value = totalPages;
      totalElements.value = total;
      paginationOptions.value.totalElements = total;
      perPage.value = pageSize;

      if (content.length < pagination.limit.value) {
        console.log('Marking pagination as done - content length < limit');
        pagination.done.value = true;
      }
      
      console.groupEnd();
    },
    true
  );
}
  let controller;
  let timeout;
  function fetchSearch(next = true, current = false) {
    if (next && searchPagination.done.value) return;

    if (controller) controller.abort();
    if (timeout) clearTimeout(timeout);
    controller = new AbortController();

    if (paginationOptions.value.store) {
      paginationOptions.value.store.set([]);
    }

    timeout = setTimeout(() => {
      req.send(
        () => ({
          ...getPaginationData(next, current),
          signal: controller.signal,
        }),
        (res) => {
          if (!res?.success) return;

          const { content, totalElements: total, totalPages } = extractPaginationData(res.data);

          if (paginationOptions.value.store) {
            paginationOptions.value.store.set(content);
          }

          searchPagination.totalPages.value = totalPages;
          totalElements.value = total;

          if (content.length < searchPagination.limit.value) {
            searchPagination.done.value = true;
          }
        },
        true
      );
    }, 20);
  }

 function next() {
    if (searching.value) {
      fetchSearch();
    } else {
      fetch(true, false, paginationOptions.value.cache);
    }
  }

  function previous() {
    if (searching.value && searchPagination.page.value == 1) return;
    if (!searching.value && pagination.page.value == 1) return;

    if (searching.value) {
      fetchSearch(false);
      searchPagination.done.value = false;
    } else {
      pagination.done.value = false;
      fetch(false, false, paginationOptions.value.cache);
    }
  }

  watch(search, () => {
    searchPagination.done.value = false;
    searchPagination.page.value = 0;
    if (search.value) {
      searching.value = true;
      fetchSearch(true, false);
    } else if (!search.value && paginationOptions.value.auto) {
      searching.value = false;
      pagination.done.value = false;
      fetch(true, true, paginationOptions.value.cache);
    }
  });

  const auto = computed(() => paginationOptions.value.auto);
  watch(auto, fetch, {
    immediate: paginationOptions.value.auto,
  });

  // watch(perPage, () => {
  //   pagination.reset(perPage.value);
  //   searchPagination.reset(perPage.value);
  //   if (search.value) {
  //     searching.value = true;
  //     fetchSearch(true, true);
  //   } else {
  //     searching.value = false;
  //     fetch(true, true, paginationOptions.value.cache);
  //   }
  // });

  provide("next", next);
  provide("previous", previous);
  provide("searchPage", searchPagination.page);
  provide("searchTotalPages", searchPagination.totalPages);
  provide("page", pagination.page);
  provide("totalPages", pagination.totalPages);
  provide("searching", searching);
  provide("send", send);
  provide("sendPagination", sendPagination);
  provide(
    "perPage",
    computed(() => perPage.value)
  );

  provide(
    "totalElements",
    computed(() => totalElements.value)
  );

  const page = computed(() => {
    return searching.value
      ? searchPagination.page.value
      : pagination.page.value;
  });

  function send() {
    pagination.reset();
    searchPagination.reset();
    fetch();
  }

function sendPagination(limit, page) {
  if (page) {
    pagination.reset(perPage.value); // Pass current perPage
    searchPagination.reset(perPage.value);
    pagination.page.value = page;
  } else {
    perPage.value = limit; // Update the source of truth
    pagination.reset(limit);
    searchPagination.reset(limit);
  }
  fetch();
}

  return {
    page: computed(() => {
      const p = searching.value ? searchPagination.page.value : pagination.page.value;
      console.log('Current page:', p);
      return p;
    }),
    search,
    perPage,
    totalElements: computed(() => {
      console.log('Current totalElements:', totalElements.value);
      return totalElements.value;
    }),
    send,
    sendPagination,
    totalPages: computed(() => 
      searching.value 
        ? searchPagination.totalPages.value 
        : pagination.totalPages.value
    ),
    data: computed(() => 
      paginationOptions.value.store && !searching.value
        ? paginationOptions.value.store.getAll()
        : req.response.value?.content || req.response.value?.data || []
    ),
    error: req.error,
    pending: req.pending,
    dirty: req.dirty,
    next,
    previous,
  };
}
