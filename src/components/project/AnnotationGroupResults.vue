<template>
  <div class="content-wrapper">
    <b-loading :is-full-page="false" :active="loading" />
    <div v-if="!loading" class="panel">
      <div class="panel-heading">
        <p>{{ group.groupName }} results</p>
      </div>
      <div class="panel-block">
        <template v-if="analyses" v-for="analysis in analyses">
          <div v-if="analysis.status === 'success'" :key="analysis.id">
            <div class="results_grid">
              <div class="results_method">
                <b-table
                  v-if="analysis.annotations"
                  :data="analysis.annotations"
                >
                  <template #default="{row: annotation}">
                    <template v-for="resultObject in Object.keys(annotation.results)">
                        <template v-for="(resultPart, index) in Object.keys(annotation.results[resultObject])">
                          <b-table-column :key="index" :label="resultPart" centered>
                            <template v-for="(result) in Object.keys(annotation.results[resultObject][resultPart])">
                              <p :key="result" class="result">{{ result }}: <span>{{ annotation.results[resultObject][resultPart][result] }}</span></p>
                            </template>
                          </b-table-column>
                        </template>
                    </template>
                  </template>
                </b-table>
              </div>
            </div>
          </div>
          <div v-else-if="analysis.status === 'pending'" :key="analysis.id">
            <section class="status-div">
              <p class="status">Pending...</p>
              <progress class="progress is-small is-primary" max="100" />
            </section>
          </div>
          <div v-else :key="analysis.id">
            <p class="status">Failed.</p>
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
      analysisWithResult: [],
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
          for (let annotation of response.annotations) {
            for (let result of Object.keys(annotation.results)) {
              const orderedResult = {};
              for (let k in result) {
                orderedResult[k] = annotation.results[k];
              }
              annotation.results = orderedResult;
            }
          }
          analysis.annotations = response.annotations;
        }
      }
      return analyses;
    },
  },
  async created() {
    this.group = await this.getGroup();
    let analyses = this.group.analyses;
    analyses = await this.getResults(analyses);
    this.analyses = analyses;
    this.loading = false;
  }
};
</script>

<style lang="scss" scoped>

  .status {
    text-align: center;
    font-size: 18px;
  }

  .status-div {
    margin: 10rem;
  }

  .result {
    text-transform: capitalize;
    font-weight: 600;

    > span {
      font-weight: 400;
    }
  }
</style>
