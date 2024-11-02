import { SubscriptionBase } from './util/subscription'
import { sql } from 'kysely'
import { Database } from './db'
import { OutputSchema, isLabels } from './lexicon/types/com/atproto/label/subscribeLabels'

export class LabelerSubscription extends SubscriptionBase {
  constructor(
    public db: Database,
    public service: string,
    public moderationLabels: string[] = [],
  ) {
    super(db, service, 'com.atproto.label.subscribeLabels')
  }

  async handleEvent(evt: OutputSchema) {
    console.log({ evt }, 'labeler subscription event')
    if (!isLabels(evt)) return

    for (const label of evt.labels) {
      if (!this.moderationLabels.includes(label.val)) continue

      try {
        const log = `\n${label.val}@${label.cts} by ${this.service.replace(
          'wss://',
          '',
        )} ${label.neg ? 'removed' : 'added'}`

        console.log(log)
        // await this.db
        //   .updateTable('post')
        //   .set({
        //     hidden: true,
        //     moderationHistory: sql`moderationHistory || '${log}'`,
        //   })
        //   .whereExists((db) =>
        //     db.selectFrom('post').where('uri', '=', label.uri),
        //   )
        //   .execute()
      } catch (e) {
        console.error(
          `${this.service}/xrpc/${this.type} subscription errored:`,
          e,
        )
      }
    }
  }
}