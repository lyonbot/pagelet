
### Look into the `dataSource`

Before disassembling the SmartTable, let's investigate the `dataSource`

It plays the role of a **model** (of MVC/MVVM) and a **state manager**.

```ts
// typescript
class AlbumCollectionDataSource extends CompositeState(
  Protocol.WithLoadingStatus,
  Protocol.List,
  Protocol.Actions,
  Protocol.CountablePaging,
  Protocol.Filter
) {
  $eventsSchema = {
    ...Protocol.WithLoadingStatus.eventsSchema,
    ...Protocol.List.eventsSchema,
    ...Protocol.Actions.eventsSchema,
  };

  // ------------------------------------------
  // implements WithLoadingStatus protocol
  $isLoading: boolean | string;

  // ------------------------------------------
  // implements List protocol
  $items: Album[];
  $itemSchema: Protocol.List.ItemSchema;

  // ------------------------------------------
  // implements Actions protocol
  $actions: AlbumCollectionAction;
  $actionsSchema: Protocol.Actions.ActionsSchema;

  // ------------------------------------------
  // implements CountablePaging protocol

  $offset: number; // current offset
  $total: number; // current total
  $pageSize: number;
  $countablePaging;

  // ------------------------------------------
  // implements Filter protocol

  $filter: AlbumCollectionFilterParams;
  $filterSchema: Protocol.Filtering.FilterSchema;
  $resetFilter(): void;
}

// customized by Albums the DataSource
interface AlbumCollectionFilterParams {
  id: string;
  idMode: "exact" | "";
}

interface Album {}
```

You may have noticed lots of `Protocol.XXX.XXXSchema`. If the DataSource has implemented a protocol, a schema is required.

- Filter Protocl

- `$filterSchema` define all available filter params, and default filter layout, can be generated from tsdoc of AlbumCollectionFilterParams
