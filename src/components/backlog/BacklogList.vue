<!-- Sortable data table of all items with color, dates, collection chips, and inline edit/delete actions. -->
<script setup lang="ts">
import { computed } from 'vue'
import { useItemsStore } from '@/stores/items'
import { useCollectionsStore } from '@/stores/collections'
import ColorSwatch from '@/components/ColorSwatch.vue'
import DateChip from '@/components/DateChip.vue'
import CollectionChip from '@/components/collections/CollectionChip.vue'
import { useInterfaceStore } from '@/stores/interface'

const props = defineProps<{
  itemIds: string[]
}>()

const itemsStore = useItemsStore()
const collectionsStore = useCollectionsStore()
const userInterface = useInterfaceStore()

const headers = [
  { key: 'color', title: '', sortable: false, width: '40px' },
  { key: 'name', title: 'Name', sortable: true },
  { key: 'description', title: 'Description', sortable: false },
  { key: 'startDate', title: 'Start', sortable: true },
  { key: 'endDate', title: 'End', sortable: true },
  { key: 'collections', title: 'Collections', sortable: false },
  { key: 'actions', title: '', sortable: false, width: '40px' },
]

const rows = computed(() => props.itemIds.map((id) => ({ id, ...itemsStore.getItem(id) })))

function collectionIdsFor(itemId: string) {
  return collectionsStore.collectionIds.filter((cid) =>
    collectionsStore.getCollection(cid).items.includes(itemId),
  )
}

function createItem() {
  userInterface.openItemCreator()
}

async function deleteItem(id: string) {
  const name = itemsStore.getName(id)
  if (
    await userInterface.revealSpeedBump(
      `Are you sure you want to delete "${name}"? This cannot be undone.`,
    )
  ) {
    itemsStore.deleteItem(id)
  }
}
</script>

<template>
  <v-data-table
    :headers="headers"
    :items="rows"
    item-value="id"
    class="clickable-rows"
    @click:row="
      (_: Event, { item }: { item: { id: string } }) => userInterface.openItemViewer(item.id)
    "
  >
    <template #top>
      <v-btn prepend-icon="mdi-plus" variant="text" @click="createItem">New item</v-btn>
    </template>
    <template #item.color="{ item }">
      <ColorSwatch :color="item.color" />
    </template>
    <template #item.description="{ item }">
      <span class="truncate">{{ item.description }}</span>
    </template>
    <template #item.startDate="{ item }">
      <DateChip :date="item.startDate" />
    </template>
    <template #item.endDate="{ item }">
      <DateChip :date="item.endDate" />
    </template>
    <template #item.collections="{ item }">
      <CollectionChip
        v-for="cid in collectionIdsFor(item.id)"
        :key="cid"
        :collection-id="cid"
        class="mr-1"
      />
    </template>
    <template #item.actions="{ item }">
      <v-menu>
        <template #activator="{ props: menuProps }">
          <v-btn
            icon="mdi-dots-vertical"
            v-bind="menuProps"
            variant="text"
            density="compact"
            @click.stop
          />
        </template>
        <v-list density="compact">
          <v-list-item
            title="Edit"
            prepend-icon="mdi-pencil"
            @click="userInterface.openItemEditor(item.id)"
          />
          <v-list-item title="Delete" prepend-icon="mdi-delete" @click="deleteItem(item.id)" />
        </v-list>
      </v-menu>
    </template>
  </v-data-table>
</template>

<style scoped>
.clickable-rows :deep(tbody tr) {
  cursor: pointer;
}

.truncate {
  display: block;
  max-width: 200px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
