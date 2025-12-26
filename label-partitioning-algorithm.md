# The Label Partitioning Algorithm

One of the trickier problems: how do you organize tasks in a dashboard without forcing users into a specific labeling convention? Everyone uses labels differently—some do phases, some do features, some do both. The viewer needs to figure it out automatically.

My goal is to make the partitioning system as user-agnostic as possible, allowing any personal style of labeling. Currently, we look for group families by sequential heuristics.

The algorithm automatically partitions issues into meaningful workstreams by analyzing label patterns and dependency structure. It works as follows:

## Step 1: Detect Label Families

The system identifies different types of label patterns:

- Sequential labels (e.g., `phase1`, `phase2`, `phase3`)
- Prefixed labels (e.g., `feat:auth`, `feat:payments`)
- Suffix-based labels (e.g., `auth-backend`, `auth-frontend`)

## Step 2: Score Each Family

Each detected family is scored based on:

- **Coverage**: What percentage of issues have these labels?
- **Exclusivity**: Do issues have exactly one label from the family?
- **Balance**: Are the resulting groups similarly sized?

Sequential families receive a scoring boost since they imply workflow stages.

## Step 3: Select Primary Grouping

The highest-scoring family becomes the primary grouping dimension. The current view's filter label is automatically excluded to ensure grouping happens along an orthogonal axis (e.g., filtering by `phase1` groups by feature, not by phase).

## Step 4: Handle Sparse Labels

For sparsely-labeled issue sets, the algorithm falls back to dependency graph analysis—finding connected components via `blocks` and parent-child edges and naming them by their root issue or most common label.

## Recursive Subdivision

The system supports recursive subdivision: each workstream can be further partitioned using the next-best label family, with previously-used families excluded and scoring thresholds relaxed at deeper levels.

## Label Propagation

Labels propagate downstream through blocking relationships, so "label the entrypoint only" workflows still produce correct groupings.

## Example

You have 20 issues tagged with `phase1`, `phase2`, `feat:auth`, and `feat:payments`. If you filter by `phase1`, the viewer groups by feature (auth vs payments). If you filter by `feat:auth`, it groups by phase. The orthogonal dimension always wins.

The result is a hierarchical view that adapts to however users have chosen to organize their work, requiring zero configuration.
