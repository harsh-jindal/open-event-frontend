import Component from '@ember/component';
import { computed } from '@ember/object';
import FormMixin from 'open-event-frontend/mixins/form';
import { protocolLessValidUrlPattern } from 'open-event-frontend/utils/validators';

export default Component.extend(FormMixin, {

  getValidationRules() {
    return {
      inline : true,
      delay  : false,
      on     : 'blur',
      fields : {
        name: {
          rules: [
            {
              type   : 'empty',
              prompt : this.get('l10n').t('Please give your sponsor a name')
            }
          ]
        },
        image_upload: {
          rules: [
            {
              type   : 'empty',
              prompt : this.get('l10n').t('Please upload sponsor\'s logo.')
            }
          ]
        },
        sponsorUrl: {
          identifier : 'sponsor_url',
          rules      : [
            {
              type   : 'regExp',
              value  : protocolLessValidUrlPattern,
              prompt : this.get('l10n').t('Please enter a valid url')
            }
          ]
        }
      }
    };
  },

  sponsors: computed('data.sponsors.@each.isDeleted', function() {
    return this.get('data.sponsors').filterBy('isDeleted', false);
  }),

  actions: {
    addSponsor() {
      let sponsors = this.get('data.sponsors');
      let incorrect_sponsors = sponsors.filter(function(sponsor) {
        return (!sponsor.get('name'));
      });
      if (incorrect_sponsors.length > 0) {
        this.notify.error(this.get('l10n').t('Please fill the required fields for existing sponsor items'));
        this.set('isLoading', false);
      } else {
        this.get('data.sponsors').addObject(this.store.createRecord('sponsor'));
      }
    },
    removeSponsor(sponsor) {
      sponsor.deleteRecord();
    },
    saveDraft() {
      this.onValid(() => {
        let sponsors = this.get('data.sponsors');
        let incorrect_sponsors = sponsors.filter(function(sponsor) {
          return (!sponsor.get('name'));
        });
        if (incorrect_sponsors.length > 0) {
          this.notify.error(this.get('l10n').t('Please fill the required fields.'));
          this.set('isLoading', false);
        } else {
          this.set('data.event.state', 'draft');
          this.sendAction('save');
        }
      });
    },
    move(direction) {
      this.onValid(() => {
        this.sendAction('move', direction);
      });
    },
    publish() {
      this.onValid(() => {
        this.set('data.event.state', 'published');
        this.sendAction('save');
      });
    }
  },

  didInsertElement() {
    if (this.get('data.sponsors') && !this.get('data.sponsors.length')) {
      this.get('data.sponsors').addObject(this.store.createRecord('sponsor'));
    }
  }
});
