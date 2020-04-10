<template>
  <div class="content-wrapper">
    <b-loading :is-full-page="false" :active="loading" />
    <div v-if="!loading" class="panel">
      <div class="panel-heading">
        <p>{{ group.groupName }} results</p>
        <a ref="download" style="display: none"/>
        <button class="button" @click="downloadCSV(group.groupName)"><i class="fas fa-file-export" style="margin-right:5px"/>Export CSV</button>
      </div>
      <div class="panel-block">
            <b-table
              v-if="group.annotations"
              :data="group.annotations"
            >
              <template #default="{row: annotation}">
                <template v-for="(result, index) in annotation.results">
                  <b-table-column :key="result.name" :label="result.name" centered :class="index !== annotation.results.length - 1 ? 'border-right' : ''">
                    <div class="component-grid" :style="`grid-template-columns: ${'1fr '.repeat(result.components.length)};`">
                      <template v-for="component in result.components">
                        <div :key="component.name">
                          <h3>{{ component.name }}</h3>
                          <p class="subcomponent" :key="component.name + subcomponent.name" v-for="subcomponent in component.components">
                            {{ subcomponent.name }}: <span>{{ subcomponent.val.toFixed(3) }}</span>
                          </p>
                        </div>
                      </template>
                    </div>
                  </b-table-column>
                </template>
                <b-table-column width="150" centered>
                  <button class="button is-link" @click="openAnnotation(annotation.annotationId)">View annotation</button>
                </b-table-column>
              </template>
              <template #empty>
                <div class="content has-text-grey has-text-centered">
                  <p>No results found</p>
                </div>
              </template>
            </b-table>
          </div>
      </div>
    </div>
</template>

<script>
import { Annotation } from 'cytomine-client';

export default {
  name: 'AnnotationGroupResults',
  data() {
    return {
      group: {},
      analyses: [],
      loading: true,
    };
  },
  computed: {
    projectId() {
      return this.$router.history.current.params.idProject;
    },
  },
  methods: {
    async getGroup() {
      return await fetch(`${this.$store.state.baseUrl}/analysisResults?groupId=${this.$router.history.current.params.idGroup}`);
    },
    async openAnnotation(annotationId) {
      const projectId = this.$router.history.current.params.idProject;
      const annotationObject = await Annotation.fetch(annotationId);
      this.$router.push({ path: `/project/${projectId}/image/${annotationObject.image}/annotation/${annotationId}`});
    },
    async downloadCSV(name) {
      try {
        let csvContent = await fetch(`${this.$store.state.baseUrl}/exportAnalysisResults?groupId=${this.group.groupId}`);
        csvContent = await csvContent.json();
        let a = this.$refs.download;
        const csv = atob(csvContent.data),
          blob = new Blob([csv], {type: 'data:application/octet-stream;base64'}),
          url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = `${name}-csv-export.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        // Show snackbar
        this.$notify({type: 'success', text: 'Exported analysis results'});
      }
      catch(e) {
        console.error(e);
        this.$notify({type: 'error', text: 'An error occured when trying to export analysis results'});
      }
    },
    async fetchData() {
      let group = await this.getGroup();
      if (group.status === 404) {
        setTimeout(() => {
          this.fetchData();
        }, 10000);
      }
      else {
        this.group = await group.json();
        this.loading = false;
      }
    }
  },
  async created() {
    await this.fetchData();
  }
};
</script>

<style lang="scss" scoped>
  .panel-heading {
    display: grid;
    grid-template-columns: 1fr 1fr;

    > button {
      max-width: fit-content;
      justify-self: flex-end;
    }
  }

  h2 > span {
    font-weight: 400;
  }

  .failed {
    color: #ff3860;

    > i {
      margin-right: 5px;
    }
  }
  .analysis-container {
    margin-top: 5rem;
    padding-top: 25px;
  }

  .analysis-container:first-child {
    margin-top: 0;
    margin-bottom: 2rem;
  }

  .status {
    text-align: center;
    font-size: 18px;
  }

  .status-div {
    margin: auto;
    width: 50%;
    max-width: 500px;
  }

  .subcomponent {
    text-transform: capitalize;
    font-weight: 600;

    > span {
      font-weight: 400;
    }
  }

  .component-grid {
    display: grid;
  }

  td {
    vertical-align: middle !important;
  }

  .border-right {
    border-right: 1px solid #dbdbdb;
  }
</style>
