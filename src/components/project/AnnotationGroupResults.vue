<template>
  <div class="content-wrapper">
    <b-loading :is-full-page="false" :active="loading" />
    <div v-if="!loading" class="panel">
      <div class="panel-heading">
        <p>{{ group.groupName }} results</p>
      </div>
      <div class="panel-block">
        <template v-if="analyses" v-for="analysis in analyses">
          <div v-if="analysis.status === 'success'" :key="analysis.analysisId" class="analysis-container">
            <div class="analysis-header">
              <h2>Analysis ID: <span>{{ analysis.analysisId }}</span></h2>
              <a ref="download" style="display: none"/>
              <button class="button" @click="downloadCSV(analysis.analysisId)"><i class="fas fa-file-export" style="margin-right:5px"/>Export CSV</button>
            </div>
            <b-table
              v-if="analysis.annotations"
              :data="analysis.annotations"
            >
              <template #default="{row: annotation}">
                <template v-for="(result, index) in annotation.results">
                  <b-table-column :key="result.name" :label="result.name" centered :class="index !== annotation.results.length - 1 ? 'border-right' : ''">
                    <div class="component-grid" :style="`grid-template-columns: ${'1fr '.repeat(result.components.length)};`">
                      <template v-for="component in result.components">
                        <div :key="component.name">
                          <h3>{{ component.name }}</h3>
                          <p class="subcomponent" :key="component.name + subcomponent.name" v-for="subcomponent in component.components">
                            {{ subcomponent.name }}: <span>{{ subcomponent.val.toFixed(2) }}</span>
                          </p>
                        </div>
                      </template>
                    </div>
                  </b-table-column>
                </template>
                <b-table-column centered>
                  <button class="button is-link" @click="openAnnotation(annotation.imageId, annotation.annotationId)">View annotation</button>
                </b-table-column>
              </template>
            </b-table>
          </div>
          <div v-else-if="analysis.status === 'pending'" :key="analysis.id" class="analysis-container">
            <h2>Analysis ID: <span>{{ analysis.analysisId }}</span></h2>
            <div class="status-div">
              <p class="status">Pending...</p>
              <progress class="progress is-small is-primary" max="100" />
            </div>
          </div>
          <div v-else :key="analysis.id" analysis.container>
            <h2>Analysis ID: <span>{{ analysis.analysisId }}</span></h2>
            <div class="status-div">
              <p class="status failed"><i class="fas fa-exclamation-triangle"/>Failed</p>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AnnotationGroupResults',
  data() {
    return {
      group: {},
      analyses: [],
      loading: true,
    };
  },
  methods: {
    async getGroup() {
      const getInfo = await fetch(`${this.$store.state.baseUrl}/analysisInformation?annotationGroupId=${this.$router.history.current.params.idGroup}`);
      const response = await getInfo.json();
      return response;
    },
    async getResults(analyses) {
      for (let analysis of analyses) {
        if (analysis.status === 'success') {
          const getResults = await fetch(`${this.$store.state.baseUrl}/analysisResults?analysisId=${analysis.analysisId}`);
          const response = await getResults.json();
          analysis.annotations = response.annotations;
        }
      }
      return analyses;
    },
    openAnnotation(imageId, annotationId) {
      const projectId = this.$router.history.current.params.idProject;
      this.$router.push({ path: `/project/${projectId}/image/${imageId}/annotation/${annotationId}`});
    },
    downloadCSV(analysisId) {
      console.log(`downloading ${analysisId}`);
      try {
        let csvContent = '';
        let a = this.$refs.download[0];
        const csv = atob(csvContent),
          blob = new Blob([csv], {type: 'data:application/octet-stream;base64'}),
          url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = `${analysisId}-csv-export.csv`;
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
    shouldCheckProgress(analyses) {
      return analyses.filter(analysis => analysis.status === 'pending').length > 0;
    },
    async fetchData() {
      this.group = await this.getGroup();
      // let analyses = this.group.analyses;
      // analyses = await this.getResults(analyses);
      let analyses = [
        {
          analysisId: 'kasjdlhjsdjfghdkasd',
          annotationGroupId: 'ajdhfgkjsdfhg',
          annotations: [],
          groupName: null,
          status: 'failed',
        },
        {
          analysisId: 'shjdfgsdk',
          annotationGroupId: 'ajdhfgkjsdfhg',
          annotations: [],
          groupName: null,
          status: 'pending',
        },
        {
          analysisId: 'lskljdflk',
          annotationGroupId: 'ajdhfgkjsdfhg',
          annotations: [],
          groupName: null,
          status: 'success',
        },
      ];
      for (let analysis of analyses) {
        analysis.annotations = [
          {
            annotationId: '1032341',
            imageId: '386531',
            results: [
              {
                name: 'HE',
                components: [
                  {
                    name: 'H',
                    components: [
                      {
                        name: 'mean',
                        val: -0.20421988842343536
                      },
                      {
                        name: 'std',
                        val: 0.2842343536
                      },
                    ]
                  },
                  {
                    name: 'E',
                    components: [
                      {
                        name: 'mean',
                        val: 0.241882343536
                      },
                      {
                        name: 'std',
                        val: 0.242343536
                      },
                    ]
                  }
                ]
              },
              {
                name: 'HSV',
                components: [
                  {
                    name: 'H',
                    components: [
                      {
                        name: 'mean',
                        val: -0.20421988842343536
                      },
                      {
                        name: 'std',
                        val: 0.2842343536
                      },
                    ]
                  },
                  {
                    name: 'S',
                    components: [
                      {
                        name: 'mean',
                        val: 0.241882343536
                      },
                      {
                        name: 'std',
                        val: 0.242343536
                      },
                    ]
                  },
                  {
                    name: 'V',
                    components: [
                      {
                        name: 'mean',
                        val: 0.882343536
                      },
                      {
                        name: 'std',
                        val: 0.22343536
                      },
                    ]
                  }
                ]
              }],
          },
          {
            annotationId: '1032341',
            imageId: '386531',
            results: [
              {
                name: 'HE',
                components: [
                  {
                    name: 'H',
                    components: [
                      {
                        name: 'mean',
                        val: -0.20421988842343536
                      },
                      {
                        name: 'std',
                        val: 0.2842343536
                      },
                    ]
                  },
                  {
                    name: 'E',
                    components: [
                      {
                        name: 'mean',
                        val: 0.241882343536
                      },
                      {
                        name: 'std',
                        val: 0.242343536
                      },
                    ]
                  }
                ]
              },
              {
                name: 'HSV',
                components: [
                  {
                    name: 'H',
                    components: [
                      {
                        name: 'mean',
                        val: -0.20421988842343536
                      },
                      {
                        name: 'std',
                        val: 0.2842343536
                      },
                    ]
                  },
                  {
                    name: 'S',
                    components: [
                      {
                        name: 'mean',
                        val: 0.241882343536
                      },
                      {
                        name: 'std',
                        val: 0.242343536
                      },
                    ]
                  },
                  {
                    name: 'V',
                    components: [
                      {
                        name: 'mean',
                        val: 0.882343536
                      },
                      {
                        name: 'std',
                        val: 0.22343536
                      },
                    ]
                  }
                ]
              }],
          }
        ];
      }
      if (this.shouldCheckProgress(analyses)) {
        // Fetch analyses again in 10 seconds
        setTimeout(() => {
          this.fetchData();
        }, 10000);
      }
      this.analyses = analyses;
    }
  },
  async created() {
    await this.fetchData();
    this.loading = false;
  }
};
</script>

<style lang="scss" scoped>
  .analysis-header {
    display: grid;
    grid-template-columns: 1fr 0fr;
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
