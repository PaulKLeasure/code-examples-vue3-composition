<template>
  <div class="tagbot tagbot-rules">
    <Message
      v-for="msg of messages"
      :severity="msg.severity"
      :key="msg.content"
      :sticky="false"
      :life="10000"
      >{{ msg.content }}</Message
    >
    <div class="header card">
      <DataTable
        ref="dt"
        :value="tagbotRules"
        :selection="selectedTagbotRules"
        data-key="id"
        :paginator="true"
        :rows="25"
        :filters="filters"
        paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rows-per-page-options="[10, 25, 50, 500, 1000]"
        current-page-report-template="Showing {first} to {last} of {totalRecords} tagbotRules"
        responsive-layout="scroll"
      >
        <template #header>
          <div
            class="table-header flex flex-column md:flex-row md:justiify-content-between"
          >
            <h2 class="mb-2 md:m-0 p-as-md-center">Rule Manager</h2>

            <span class="tagbot-search-rules p-input-icon-left">
              <i class="pi pi-search" />
              <PfInputText
                v-model="filters['global'].value"
                placeholder="Search..."
              />
            </span>
            <span class="tagbot-new-rule-but p-input-icon-left">
              <PfButton
                label="New"
                icon="pi pi-plus"
                class="p-button-success mr-2"
                @click="openNew"
              />
            </span>
          </div>
        </template>
        <!-- /////////////////////////////////////// -->
        <!-- ///           DATA  ROWS            /// -->
        <!-- /////////////////////////////////////// -->
        <Column
          class="tagbot-table-col-rule-id"
          field="id"
          header="Map ID"
          :sortable="true"
          style="width:5%"
          >{{ slotProps.data.index }}</Column
        >
        <Column
          class="tagbot-table-col-rule-mode"
          field="mode.name"
          header="Mode"
          :sortable="true"
          style="width:5%"
        ></Column>
        <Column
          class="tagbot-table-col-rule-nomenclature"
          field="nomenclature"
          header="Nomenclature"
          :sortable="true"
          style="width:25%"
        ></Column>
        <Column
          class="tagbot-table-col-rule-logic"
          field="logic"
          header="Mapping Logic"
          :sortable="true"
          style="width:50%"
        ></Column>
        <Column
          class="tagbot-table-col-rule-option_ids"
          field="optionIds"
          header="Option Ids"
          :sortable="true"
          style="width:15%"
        ></Column>
        <Column :exportable="false" style="min-width:8rem">
          <template #body="slotProps">
            <PfButton
              icon="pi pi-pencil"
              class="p-button-rounded p-button-success mr-2"
              @click="editTagbotRule(slotProps.data)"
            />
            <PfButton
              icon="pi pi-trash"
              class="p-button-rounded p-button-warning"
              @click="confirmDeleteTagbotRule(slotProps.data)"
            />
          </template>
        </Column>
      </DataTable>
    </div>
    <!-- /////////////////////////////////////// -->
    <!-- ///        CREATE and UPDATE        /// -->
    <!-- ///          Dialog Section         /// -->
    <!-- /////////////////////////////////////// -->
    <PfDialog
      :visible="tagbotRuleDialog"
      :style="{ width: '450px' }"
      header="Rule Details"
      :modal="true"
      class="p-fluid"
    >
      <div class="field">
        <label for="ruleMode" class="mb-3">Rule Mapping Mode</label>
        <Dropdown
          id="ruleMode"
          v-model="ruleModes.selectedMode"
          :options="ruleModes.modes"
          option-label="mode_label"
          placeholder="Select a maping mode"
          option-value="mode_id"
          @change="
            $event => {
              individualRule.mode.id = $event.value;
            }
          "
        >
        </Dropdown>
      </div>
      <div class="field">
        <label for="nomenclature">Nomenclature</label>
        <PfInputText
          id="nomenclature"
          v-model.trim="individualRule.nomenclature"
          required="true"
          autofocus
          :class="{ 'p-invalid': submitted && !individualRule.nomenclature }"
        />
        <small class="p-error" v-if="submitted && !individualRule.nomenclature"
          >Nomenclature is required.</small
        >
      </div>
      <div class="field">
        <label for="logic">Mapping Logic</label>
        <p>
          <span class="edit-logic-if">IF </span>
          <PfInputText
            id="logic"
            v-model.trim="individualRule.logic"
            required="true"
            autofocus
            :class="{ 'p-invalid': submitted && !individualRule.logic }"
          />
        </p>
        <!-- <small class="p-error" v-if="submitted && !individualRule.logic">Logic is required.</small> -->
      </div>
      <div class="field">
        <label for="nomenclature">Option Ids</label>
        <PfInputText
          id="nomenclature"
          v-model.trim="individualRule.optionIds"
          required="true"
          autofocus
          :class="{ 'p-invalid': submitted && !individualRule.optionIds }"
        />
        <!-- <small class="p-error" v-if="submitted && !individualRule.optionIds">Option Ids required.</small>  -->
      </div>
      <template #footer>
        <PfButton
          label="Cancel"
          icon="pi pi-times"
          class="p-button-text"
          @click="hideDialog"
        />
        <PfButton
          label="Save"
          icon="pi pi-check"
          class="p-button-text"
          @click="tagbotRuleCrudControl()"
        />
      </template>
    </PfDialog>
    <!-- /////////////////////////////////////// -->
    <!-- /// DELETE RULE     Dialog Section  /// -->
    <!-- /////////////////////////////////////// -->
    <PfDialog
      :visible="deleteTagbotRuleDialog"
      :style="{ width: '450px' }"
      header="Confirm"
      :modal="true"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span v-if="individualRule"
          >Are you sure you want to delete <b>{{ individualRule.name }}</b
          >?</span
        >
      </div>
      <template #footer>
        <PfButton
          label="No"
          icon="pi pi-times"
          class="p-button-text"
          @click="deleteTagbotRuleDialog = false"
        />
        <PfButton
          label="Yes"
          icon="pi pi-check"
          class="p-button-text"
          @click="tagbotRuleCrudControl()"
        />
      </template>
    </PfDialog>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { FilterMatchMode } from "primevue/api";
import TagbotService from "@/services/TagbotService.js";

export default {
  setup() {
    onMounted(() => {
      getTagbotMappingRules();
    });
    const messages = ref([]);
    const dt = ref();
    const tagbotRules = ref();
    const tagbotRuleDialog = ref(false);
    const deleteTagbotRulesDialog = ref(false);
    const deleteTagbotRuleDialog = ref(false);
    const individualRule = ref({});
    const tagbotCrudMode = ref("");
    const selectedTagbotRules = ref();
    const filters = ref({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    });
    const submitted = ref(false);
    const ruleModes = ref({
      selectedMode: null,
      modes: [
        { mode_label: "ALL", mode_id: 1 },
        { mode_label: "SFK", mode_id: 2 },
        { mode_label: "Non-Public", mode_id: 5 }
      ]
    });

    const openNew = () => {
      individualRule.value = {
        id: null,
        logic: "",
        mode: { id: 1, name: "ALL" },
        nomenclature: "",
        optionIds: ""
      };
      submitted.value = false;
      tagbotRuleDialog.value = true;
      tagbotCrudMode.value = "CREATE";
    };
    const hideDialog = () => {
      tagbotRuleDialog.value = false;
      submitted.value = false;
    };

    const editTagbotRule = ruleIn => {
      //console.log("EDIT editTagbotRule: ", JSON.parse(JSON.stringify(ruleIn)));
      individualRule.value = JSON.parse(JSON.stringify(ruleIn));
      tagbotRuleDialog.value = true;
      tagbotCrudMode.value = "UPDATE";
    };
    const confirmDeleteTagbotRule = ruleIn => {
      individualRule.value = ruleIn;
      tagbotCrudMode.value = "DELETE";
      deleteTagbotRuleDialog.value = true;
    };

    const exportCSV = () => {
      dt.value.exportCSV();
    };
    const confirmDeleteSelected = () => {
      deleteTagbotRulesDialog.value = true;
    };

    const tagbotRuleCrudControl = () => {
      const crudType = tagbotCrudMode.value;
      const dat = individualRule.value;
      //let isProxy = dataIn[1];// Vue JS make sthis a Proxy
      // TRICK to make Proxy readable as an object
      //let dat = JSON.parse(JSON.stringify(isProxy));
      //console.log("updateTagbotMapping() crudType:", crudType);
      //console.log("updateTagbotMapping() DATA:", dat);

      if (crudType === "CREATE") {
        // CREATE this rule via API
        //console.log("NEW DATA: ", dat);
        // Change the mode object to just a mode ID
        dat.mode = dat.mode.id;
        tagbotRuleDialog.value = false;
        tagbotCrudMode.value = "";
        individualRule.value = {};
        return TagbotService.createTagbotMapping(dat)
          .then(response => {
            //console.log(
            //  "TagbotService.createTagbotMapping(" + dat + "):",
            //  response.data
            //);
            if (response.data.success) {
              messages.value.push({
                severity: "success",
                content: "Successful! Tagbot rule created"
              });
              getTagbotMappingRules();
            } else {
              messages.value.push({
                severity: "error",
                content: "Tagbot rule creation Error: " + response.data.error
              });
            }
          })
          .catch(error => {
            console.log(error);
            messages.value.push({
              severity: "error",
              content: "Tagbot rule creation Error: " + error
            });
          });
      }

      if (crudType === "UPDATE") {
        //console.log("updateTagbotMapping() crudType:", crudType);
        tagbotRuleDialog.value = false;
        tagbotCrudMode.value = "";
        individualRule.value = {};
        // Change the mode object to just a mode ID
        dat.mode = dat.mode.id;
        //console.log("NEW DATA: ", dat);
        // UPDATE this rule via API
        return TagbotService.updateTagbotMappingsById(dat)
          .then(response => {
            //console.log(
            //  "TagbotService.updateTagbotMappingsById(" + dat + "):",
            //  response.data
            //);
            if (response.data.success) {
              messages.value.push({
                severity: "success",
                content: "Successful! Tagbot rule updated"
              });
              getTagbotMappingRules();
            } else {
              messages.value.push({
                severity: "error",
                content: "Tagbot rule update Error: " + response.data.error
              });
            }
          })
          .catch(error => {
            console.log(error);
            messages.value.push({
              severity: "error",
              content: "Tagbot rule update Error: " + error
            });
          });
      }

      if (crudType === "DELETE") {
        //console.log("updateTagbotMapping() crudType:", crudType);
        //deleteTagbotRulesDialog.value = false;
        deleteTagbotRuleDialog.value = false;
        tagbotCrudMode.value = "";
        individualRule.value = {};
        // DELETE this rule via API
        return TagbotService.deleteTagbotMapping(dat.id)
          .then(response => {
            //console.log(
            //  "TagbotService.deleteTagbotMapping(" + dat.id + "):",
            //  response.data
            //);
            if (response.data.success) {
              messages.value.push({
                severity: "success",
                content: "Successful! Tagbot rule delted"
              });
              getTagbotMappingRules();
            } else {
              messages.value.push({
                severity: "error",
                content: "Tagbot rule deletion Error: " + response.data.error
              });
            }
          })
          .catch(error => {
            console.log(error);
            messages.value.push({
              severity: "error",
              content: "Tagbot rule deletion Error: " + error
            });
          });
      }
    };

    const getTagbotMappingRules = () => {
      messages.value.push({
        severity: "warn",
        content: "CAUTION! DO NOT EDIT these rules UNLESS PROPERLY TRAINED."
      });
      TagbotService.getTagbotMappingsAll()
        .then(response => {
          //console.log("TagbotService.getTagbotMappingsAll():", response.data);
          tagbotRules.value = response.data.data;
        })
        .catch(error => {
          console.error(error);
        });
    };

    return {
      messages,
      dt,
      tagbotRules,
      individualRule,
      tagbotRuleCrudControl,
      editTagbotRule,
      confirmDeleteTagbotRule,
      tagbotRuleDialog,
      deleteTagbotRulesDialog,
      deleteTagbotRuleDialog,
      selectedTagbotRules,
      confirmDeleteSelected,
      filters,
      submitted,
      ruleModes,
      openNew,
      hideDialog,
      exportCSV
    };
  }
};
</script>

<style lang="scss">
@import "@/scss/components/tagbotCrud.scss";
</style>
