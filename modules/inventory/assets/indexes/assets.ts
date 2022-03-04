import { AbstractJavaScriptIndexCreationTask } from 'ravendb'
import { Asset } from '../models'

/**
 * Index definition for assets
 */
export class Assets extends AbstractJavaScriptIndexCreationTask<Asset> {
  constructor() {
    super()
    const { load } = this.mapUtils()
    this.map('Assets', asset => {
      // you can load other documents to include fields from related docs in the index allowing
      // a more comprehensive index. Caution required though, this can cause performance issues
      // if the loaded documents are large, this should be avoided unless absolutely necessaery
      const organisation = load(asset.organisation_id, 'Organisations')

      return {
        organisation_id: asset.organisation_id,
        organisation_name: organisation.name,
        name: asset.name,
        // you can combine properties into a single index field and set this as a search field, this uses
        // standard lucene analyzer (https://lucene.apache.org/core/7_3_1/core/org/apache/lucene/analysis/standard/StandardAnalyzer.html)
        // for searching this field
        query: [asset.name, organisation.name, organisation.id.split('/')[1], asset.id.split('/')[1]],
        patch: asset.patch
      }
    })

    this.index('query', 'Search')
  }
}
