<!-- Copyright (c) 2009-2019. Authors: see NOTICE file.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.-->


<template>
<div class="annotation-details">
  <table class="table">
    <tbody v-if="!isAnalyzing">
      <tr v-if="showImageInfo">
        <td><strong>{{$t('image')}}</strong></td>
        <td>
          <router-link :to="`/project/${annotation.project}/image/${annotation.image}`">
            <image-name :image="image" />
          </router-link>
        </td>
      </tr>

      <template v-if="isPropDisplayed('geometry-info')">
        <tr v-if="annotation.area > 0">
          <td><strong>{{$t('area')}}</strong></td>
          <td>{{ `${annotation.area.toFixed(3)} ${annotation.areaUnit}` }}</td>
        </tr>

        <tr v-if="annotation.perimeter > 0">
          <td><strong>{{$t(annotation.area > 0 ? 'perimeter' : 'length')}}</strong></td>
          <td>{{ `${annotation.perimeter.toFixed(3)} ${annotation.perimeterUnit}` }}</td>
        </tr>
      </template>

      <tr v-if="isPropDisplayed('description')">
        <td colspan="2">
          <h5>{{$t('description')}}</h5>
          <cytomine-description :object="annotation" :canEdit="canEdit" :maxPreviewLength="300" />
        </td>
      </tr>

      <!-- TERMS -->
      <tr v-if="isPropDisplayed('terms') && ontology">
        <td colspan="2">
          <h5>{{$t('terms')}}</h5>
          <b-tag v-for="{term, user} in associatedTerms" :key="term.id"
          :title="$t('associated-by', {username: user.fullName})">
            <cytomine-term :term="term" />
            <button v-if="canEditTerms" class="delete is-small" :title="$t('button-delete')"
              @click="removeTerm(term.id, user.id)">
            </button>
          </b-tag>
          <div class="add-term-wrapper" v-if="canEditTerms" v-click-outside="() => showTermSelector = false">
            <b-field>
              <b-input
                size="is-small"
                expanded
                :placeholder="$t('add-term')"
                v-model="addTermString"
                @focus="showTermSelector = true"
              />
            </b-field>

            <div class="ontology-tree-container" v-show="showTermSelector">
              <ontology-tree
                class="ontology-tree"
                :ontology="ontology"
                :searchString="addTermString"
                :selectedNodes="associatedTermsIds"
                :allowNew="true"
                @newTerm="newTerm"
                @select="addTerm"
                @unselect="removeTerm"
              />
            </div>
          </div>
          <em v-else-if="!associatedTerms.length">{{$t('no-term')}}</em>
        </td>
      </tr>

      <tr>
        <td colspan="2">
          <h5>{{$t('tags')}}</h5>
          <cytomine-tags :object="annotation" :canEdit="canEdit" />
        </td>
      </tr>

      <!-- PROPERTIES -->
      <tr v-if="isPropDisplayed('properties')">
        <td colspan="2">
          <h5>{{$t('properties')}}</h5>
          <cytomine-properties :object="annotation" :canEdit="canEdit" @update="$emit('updateProperties')" />
        </td>
      </tr>

      <tr v-if="isPropDisplayed('attached-files')">
        <td colspan="2">
          <h5>{{$t('attached-files')}}</h5>
          <attached-files :object="annotation" :canEdit="canEdit" />
        </td>
      </tr>

      <template v-if="isPropDisplayed('creation-info')">
        <tr>
          <td><strong>{{$t('created-by')}}</strong></td>
          <td>
            {{ creator.fullName }}
          </td>
        </tr>
        <tr v-if="!isReview">
          <td><strong>{{$t('created-on')}}</strong></td>
          <td> {{ Number(annotation.created) | moment('ll') }} </td>
        </tr>
        <template v-else>
          <tr>
            <td><strong>{{$t('reviewed-by')}}</strong></td>
            <td>
              {{ reviewer.fullName }}
            </td>
          </tr>
          <tr>
            <td><strong>{{$t('reviewed-on')}}</strong></td>
            <td> {{ Number(annotation.created) | moment('ll') }} </td>
          </tr>
        </template>
      </template>
    </tbody>
  </table>

  <div class="actions" v-if="!isAnalyzing">
    <router-link
      v-if="showImageInfo"
      :to="annotationURL"
      class="button is-link is-small is-fullwidth"
    >
      {{ $t('button-view-in-image') }}
    </router-link>

    <a v-else class="button is-link is-small is-fullwidth" @click="$emit('centerView')">
      {{ $t('button-center-view-on-annot') }}
    </a>

    <div class="level">
      <a :href="annotation.url + '?draw=true&complete=true&increaseArea=1.25'" target="_blank" class="level-item button is-small">
        {{ $t('button-view-crop') }}
      </a>

      <button class="level-item button is-small" @click="copyURL()">
        {{ $t('button-copy-url') }}
      </button>

      <button v-if="isPropDisplayed('comments') && comments" class="level-item button is-small"
        @click="openCommentsModal()"
      >
        {{ $t('button-comments') }} ({{comments.length}})
      </button>

      <button v-if="canEdit" class="level-item button is-small is-danger" @click="confirmDeletion()">
        {{ $t('button-delete') }}
      </button>
    </div>
  </div>
  <div class="actions" v-else>
    <div class="analysis-level">
      <button class="level-item button is-small" @click="cancelAnalysisAnnotation()">
        Cancel
      </button>
      <button class="level-item button is-small is-success" @click="confirmAnalysisAnnotation()">
        Confirm
      </button>
    </div>
  </div>
</div>
</template>

<script>
import {get} from '@/utils/store-helpers';

import {AnnotationTerm, AnnotationType, AnnotationCommentCollection} from 'cytomine-client';
import copyToClipboard from 'copy-to-clipboard';
import ImageName from '@/components/image/ImageName';
import CytomineDescription from '@/components/description/CytomineDescription';
import CytomineProperties from '@/components/property/CytomineProperties';
import CytomineTags from '@/components/tag/CytomineTags';
import CytomineTerm from '@/components/ontology/CytomineTerm';
import AttachedFiles from '@/components/attached-file/AttachedFiles';
import OntologyTree from '@/components/ontology/OntologyTree';
import AnnotationCommentsModal from './AnnotationCommentsModal';

export default {
  name: 'annotations-details',
  components: {
    ImageName,
    CytomineDescription,
    CytomineTerm,
    OntologyTree,
    CytomineTags,
    CytomineProperties,
    AttachedFiles,
    AnnotationCommentsModal
  },
  props: {
    annotation: {type: Object},
    terms: {type: Array},
    users: {type: Array},
    images: {type: Array},
    showImageInfo: {type: Boolean, default: true},
    showComments: {type: Boolean, default: false}
  },
  data() {
    return {
      addTermString: '',
      showTermSelector: false,
      comments: null,
      revTerms: 0
    };
  },
  computed: {
    configUI: get('currentProject/configUI'),
    project: get('currentProject/project'),
    ontology: get('currentProject/ontology'),

    storeModule() { // path to the vuex module in which state of this component is stored (projects/currentProject/analysis)
      return this.$store.getters['currentProject/currentProjectModule'] + 'analysis';
    },
    isAnalyzing() {
      return this.$store.state.projects[this.project.id].analysis.queuedForAnalysis.length > 0;
    },
    creator() {
      return this.users.find(user => user.id === this.annotation.user) || {};
    },
    isReview() {
      return this.annotation.type === AnnotationType.REVIEWED;
    },
    reviewer() {
      if(this.isReview) {
        return this.users.find(user => user.id === this.annotation.reviewUser) || {};
      }
    },
    canEdit() {
      return this.$store.getters['currentProject/canEditAnnot'](this.annotation);
    },
    canEditTerms() {
      // HACK: because core prevents from modifying term of algo annot (https://github.com/cytomine/Cytomine-core/issues/1138 & 1139)
      // + term modification forbidden for reviewed annotation
      return this.canEdit && this.annotation.type === AnnotationType.USER;
    },
    image() {
      return this.images.find(image => image.id === this.annotation.image) || {};
    },
    annotationURL() {
      return `/project/${this.annotation.project}/image/${this.annotation.image}/annotation/${this.annotation.id}`;
    },
    associatedTerms() {
      if(this.annotation.userByTerm) {
        return this.annotation.userByTerm.map(ubt => {
          let term = this.terms.find(term => ubt.term === term.id);
          let user = this.users.find(user => user.id === ubt.user[0]) || {}; // QUESTION: can we have several users?
          return {term, user};
        });
      }
      else {
        return [];
      }
    },
    associatedTermsIds() {
      this.revTerms;
      return this.associatedTerms.map(({term}) => term.id);
    }
  },
  methods: {
    async confirmAnalysisAnnotation() {
      // Add annotation to global state for POST-request to middleware later on
      await this.$store.commit(`${this.storeModule}/addAnnotationForAnalysis`, this.annotation.id);
      // Remove the first image from the analysis queue since we just did that one
      await this.$store.commit(`${this.storeModule}/removeFirstFromAnalysisQueue`);
      // Go to the first image in the new, mutated queue
      if (this.isAnalyzing) {
        // Still more images left to select annotations for, continue
        const queue = this.$store.state.projects[this.project.id].analysis.queuedForAnalysis;
        await this.$router.push({ path: `/project/${this.project.id}/image/${queue[0].id}` });
      }
      else {
        // No images left in the queue, go back to project analyze
        await this.$router.push({ path: `/project/${this.project.id}/choose-analysis` });
      }
    },

    cancelAnalysisAnnotation() {
      console.log('cancel annotation');
      console.log(this.annotation);
    },

    isPropDisplayed(prop) {
      return this.configUI[`project-explore-annotation-${prop}`];
    },

    copyURL() {
      copyToClipboard(window.location.origin + '/#' + this.annotationURL);
      this.$notify({type: 'success', text: this.$t('notif-success-annot-URL-copied')});
    },

    async newTerm(term) { // a new term was added to the ontology
      this.$emit('addTerm', term);
      this.$store.dispatch('currentProject/fetchOntology');
      this.addTerm(term.id);
    },

    async addTerm(idTerm) {
      if(idTerm) {
        try {
          // TODO: fix issue with AlgoAnnotation https://github.com/cytomine/Cytomine-core/issues/1139
          await new AnnotationTerm({annotation: this.annotation.id, term: idTerm}).save();
          this.$emit('updateTerms');
          this.showTermSelector = false;
        }
        catch(error) {
          this.$notify({type: 'error', text: this.$t('notif-error-add-term')});
          this.revTerms++;
        }
        finally {
          this.addTermString = '';
        }
      }
    },
    async removeTerm(idTerm, idUser) {
      idUser = idUser || this.findUserByTerm(idTerm); // if term removed from ontology tree, idUser not set => find it manually
      if(!idUser) {
        return;
      }

      try {
        // TODO fix issue with AlgoAnnotationTerm: https://github.com/cytomine/Cytomine-core/issues/1138
        await AnnotationTerm.delete(this.annotation.id, idTerm, Number(idUser));
        this.$emit('updateTerms');
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-remove-term')});
        this.revTerms++;
      }
    },
    findUserByTerm(idTerm) {
      if(this.annotation.userByTerm) {
        let match = this.annotation.userByTerm.find(ubt => ubt.term === idTerm);
        if(match) {
          return match.user[0];
        }
      }
    },

    openCommentsModal() {
      this.$modal.open({
        parent: this,
        component: AnnotationCommentsModal,
        props: {annotation: this.annotation, comments: this.comments},
        hasModalCard: true,
        events: {'addComment': this.addComment}
      });
    },

    addComment(comment) {
      this.comments.unshift(comment);
    },

    confirmDeletion() {
      this.$dialog.confirm({
        title: this.$t('confirm-deletion'),
        message: this.$t('confirm-deletion-annotation'),
        type: 'is-danger',
        confirmText: this.$t('button-confirm'),
        cancelText: this.$t('button-cancel'),
        onConfirm: () => this.deleteAnnot()
      });
    },

    async deleteAnnot() {
      try {
        await this.annotation.delete();
        this.$emit('deletion');
      }
      catch(err) {
        this.$notify({type: 'error', text: this.$t('notif-error-annotation-deletion')});
      }
    }
  },
  async created() {
    if(this.isPropDisplayed('comments') && [AnnotationType.ALGO, AnnotationType.USER].includes(this.annotation.type)) {
      try {
        this.comments = (await AnnotationCommentCollection.fetchAll({annotation: this.annotation})).array;
        if(this.showComments) {
          this.openCommentsModal();
        }
      }
      catch(error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-fetch-annotation-comments')});
      }
    }
  }
};
</script>

<style scoped>
.analysis-level {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.annotation-details {
  position: relative;
  font-size: 0.85rem;
}

.table {
  width: 100%;
  margin-bottom: 0.7em !important;
  background: transparent;
}

.table th, .table td {
  vertical-align: middle;
}

h5 {
  font-weight: 600;
  margin-bottom: 0.6em;
}

.actions {
  margin-bottom: 0.5em;
}

.actions .button {
  margin: 3px;
  box-sizing: border-box;
}

a.is-fullwidth {
  width: auto;
}

.add-term-wrapper {
  position: relative;
}

.ontology-tree-container {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 500;
  padding-top: 5px;
  background: white;
  width: 100%;
  max-height: 30vh;
  overflow: auto;
  box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
  border-radius: 4px;
  margin-top: 4px;
}

>>> .sl-vue-tree-node-item {
  font-size: 0.9em;
}

>>> .tag {
    margin-right: 5px;
    margin-bottom: 5px !important;
    background-color: rgba(0, 0, 0, 0.04);
}
</style>
