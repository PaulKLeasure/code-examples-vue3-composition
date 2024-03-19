import IvaultService from '@/services/IvaultService.js';
import { ref } from 'vue';
import { useStore } from 'vuex';

export default function () {
  // Set up awarenes of state and route
  const store = useStore();
  const filteredSugestions = ref([]);

  // Autofill tag search related
  function fetchSuggestionsAnyOptions(e) {
    // Start creating suggestions
    if (e.target.value.length >= 3) {
      const filterStr = e.target.value;
      //console.log("filterStr", filterStr);
      IvaultService.filteredAssetOtionsAny(filterStr)
        .then((response) => {
          //console.log("SUGGESTIONS:", response.data.optionGroups);
          if (response.data.optionGroups.length > 0) {
            filteredSugestions.value = response.data.optionGroups;
            store.dispatch('setAssetDetailActionAutoPicker', true);
          } else {
            filteredSugestions.value = [];
            store.dispatch('setAssetDetailActionAutoPicker', false);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      store.dispatch('setAssetDetailActionAutoPicker', false);
      filteredSugestions.value = [];
    }
  }

  return {
    filteredSugestions,
    fetchSuggestionsAnyOptions,
  };
}
