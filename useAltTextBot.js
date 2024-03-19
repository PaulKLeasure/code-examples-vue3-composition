// useAssetDetail.js
import IvaultService from '@/services/IvaultService.js';
import AltTextBotService from '@/services/AltTextBotService.js';
import { ref } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import { isProxy, toRaw } from 'vue';
export default function () {
  // Set up awarenes of state and route
  const store = useStore();
  const route = useRoute();
  //const path = route.path;
  const messages = ref([]);
  let showSpinner = ref(false);
  const query = route.query;
  const AltTextTemplateList = ref([]);
  const AltTextTemplateTestResults = computed(() => {
    return store.state.altTextBot.AltTextTemplateTestResults;
  });

  let requiredIdsText = ref('');
  let grpHeaderText = ref('');
  let assetOptionsSearchText = ref('');
  const filteredSugestions = ref([]);
  const selectedOption = ref([]);

  const goToAltTextTemplateIndex = () => {
    const origin = window.location.protocol + '//' + window.location.host;
    //console.log("REDIRECT TO:", origin + "/alt-text-template?mode=index");
    window.location.href = origin + '/alt-text-template?mode=index';
  };

  const goToAltTextTemplateUpdate = (id) => {
    const origin = window.location.protocol + '//' + window.location.host;
    window.location.href = origin + '/alt-text-template?mode=update&id=' + id;
  };

  const goToAltTextTemplateDetail = (id) => {
    const origin = window.location.protocol + '//' + window.location.host;
    window.location.href = origin + '/alt-text-template?mode=detail&id=' + id;
  };

  const goToAltTextTemplateTester = () => {
    const origin = window.location.protocol + '//' + window.location.host;
    window.location.href = origin + '/alt-text-template?mode=template-tester';
  };

  const createAltTextTemplate = (AltTextTemplateFormData) => {
    AltTextTemplateFormData = convertTemplateIdStringToArrofNums(
      AltTextTemplateFormData
    );
    store.dispatch('setAltTextTemplate', AltTextTemplateFormData);
    let payload = store.state.altTextBot.AltTextTemplate;
    if (isProxy(payload)) {
      payload = toRaw(store.state.altTextBot.AltTextTemplate);
    }
    console.log('>>>--CREATE ALT TEXT TEMPLATE (started) --->', payload);
    AltTextBotService.createAltTextTemplate(payload)
      .then((response) => {
        if (response.data) {
          response.data.data = convertTemplateIdStringToArrofNums(
            response.data.data
          );
          //console.log("CREATE TEMPLATE RESPONSE DATA", response.data.data);
          //const newId = response.data.data.id;
          //payload.id = newId;
        } else {
          console.error(response.data.message);
          alert('ERROR::createAltTextTemplate');
        }
        return response.data.data;
      })
      .then((data) => {
        //console.log(".then.then ...", data)
        store.dispatch('setAltTextTemplate', data);
        goToAltTextTemplateDetail(data.id);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const updateAltTextTemplate = (AltTextTemplateFormData) => {
    AltTextTemplateFormData = convertTemplateIdStringToArrofNums(
      AltTextTemplateFormData
    );
    store.dispatch('setAltTextTemplate', AltTextTemplateFormData);
    let payload = store.state.altTextBot.AltTextTemplate;

    AltTextBotService.updateAltTextTemplate(payload)
      .then((response) => {
        if (response.data) {
          console.log(
            'UPDATED ALtBotTemplate (in memory store)',
            store.state.altTextBot.AltTextTemplate
          );
        } else {
          console.error(response.data.message);
          alert('ERROR::createAltTextTemplate');
        }
        return response.data.data;
      })
      .then((data) => {
        //console.log(".then.then ...", data)
        store.dispatch('setAltTextTemplate', data);
        goToAltTextTemplateDetail(data.id);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const convertTemplateIdStringToArrofNums = (templateObj) => {
    if (templateObj.requiredIds !== undefined) {
      if (
        typeof templateObj.requiredIds === 'string' ||
        templateObj.requiredIds instanceof String
      ) {
        if (templateObj.requiredIds === '{}') {
          templateObj.requiredIds = [];
        } else {
          const arrOfStr = templateObj.requiredIds.replace(' ', '').split(',');
          templateObj.requiredIds = arrOfStr.map((str) => {
            return parseInt(str, 10);
          });
        }
      } else {
        if (!checkIfIsArr(templateObj.requiredIds)) {
          templateObj.requiredIds = [];
        }
      }
    } else {
      templateObj.requiredIds = [];
    }
    return templateObj;
  };

  const checkIfIsArr = (objectIn) => {
    // check if objectIn is array
    const result = Array.isArray(objectIn);
    if (result) {
      return true;
    }
    return false;
  };

  const getAltTextTemplate = (id) => {
    AltTextBotService.getAltTextTemplate(id)
      .then((response) => {
        if (response.data) {
          response.data.data.templateData = convertTemplateIdStringToArrofNums(
            response.data.data.templateData
          );
          store.state.altTextBot.AltTextTemplate =
            response.data.data.templateData;
        } else {
          console.error(response.data.message);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const resetAltTextTemplate = () => {
    store.dispatch('resetAltTextTemplate');
    console.log(
      'RESET (in memory store)',
      store.state.altTextBot.AltTextTemplate
    );
  };

  const fetchAltTextTemplateList = function () {
    AltTextBotService.getAltTextBotTemplateList(query.page)
      .then((response) => {
        if (response.data) {
          AltTextTemplateList.value = response.data.data;
        } else {
          console.error(response.data.message);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // Autofill tag search related
  function fetchSuggestions(e) {
    // Start creating suggestions
    document.getElementById(
      'altTextGrpHeaderAutoComplete'
    ).style.backgroundColor = '#fff';
    if (e.target.value.length >= 3) {
      const filterStr = e.target.value;
      IvaultService.filteredAssetOtionsAny(filterStr)
        .then((response) => {
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

  const templateRequiresAssetOptionIds = (templateName = '', opt, mode) => {
    console.log(
      'Template Requires Asset Have Option ID: ' + opt.id,
      templateName,
      'Mode: ' + mode,
      'Template:',
      store.state.altTextBot.AltTextTemplate.requiredIds
    );
    store.state.altTextBot.AltTextTemplate.requiredIds.push(opt.id);
  };

  const templateRequiresAssetWithinOptionGroup = (templateData, opt) => {
    templateData.grpHeader = opt.groupName;
    //console.log("templateRequiresAssetWithinOptionGroup:: dispatch to store", templateData);
    store.dispatch('updateAltTextTemplate', templateData);
  };

  const deleteAltTextTemplate = (id) => {
    AltTextBotService.deleteAltTextTemplate(id)
      .then((response) => {
        if (response.data) {
          resetAltTextTemplate();
          store.state.altTextBot.AltTextTemplate =
            response.data.data.templateData;
        } else {
          console.error(response.data.message);
          alert('ERROR::createAltTextTemplate');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const runAltTextTemplateTestForSpecificImage = (imageName) => {
    if (imageName == undefined || imageName.length < 1) {
      alert('you must enter an image filename!');
      return false;
    }
    const imgData = {};
    imgData['filename'] = imageName;
    store.state.altTextBot.AltTextTemplateTestResults = [];
    showSpinner.value = true;
    //console.log("Image Tester:: ", imgData);
    AltTextBotService.testAltTextByImage(imgData)
      .then((response) => {
        if (response.data) {
          showSpinner.value = false;
          if (response.data.data.altTextTestResults.length > 0) {
            store.state.altTextBot.AltTextTemplateTestResults =
              response.data.data.altTextTestResults;
          } else {
            showSpinner.value = false;
            alert('EMPTY RESULT!');
            store.state.altTextBot.AltTextTemplateTestResults = [];
          }
        } else {
          showSpinner.value = false;
          console.error(response.data.message);
          alert('ERROR::createAltTextTemplate');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return {
    messages,
    showSpinner,
    createAltTextTemplate,
    resetAltTextTemplate,
    updateAltTextTemplate,
    getAltTextTemplate,
    deleteAltTextTemplate,
    goToAltTextTemplateIndex,
    goToAltTextTemplateUpdate,
    goToAltTextTemplateDetail,
    goToAltTextTemplateTester,
    runAltTextTemplateTestForSpecificImage,
    requiredIdsText,
    grpHeaderText,
    AltTextTemplateList,
    fetchAltTextTemplateList,
    assetOptionsSearchText,
    filteredSugestions,
    selectedOption,
    fetchSuggestions,
    templateRequiresAssetWithinOptionGroup,
    templateRequiresAssetOptionIds,
    AltTextTemplateTestResults,
  };
}
