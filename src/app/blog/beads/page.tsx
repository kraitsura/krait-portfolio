"use client";

import ArticleLayout, {
  ArticleSection,
  ArticleHeading,
  ArticleSubheading,
  ArticleParagraph,
  ArticleCode,
  ArticleImagePlaceholder,
  ArticleList,
  ArticleLink,
} from "@/components/custom/ArticleLayout";

export default function BeadsArticle() {
  return (
    <ArticleLayout
      category="Task Management System"
      title="Beads"
      intro={
        <>
          A self-referential workflow system for long-horizon tasks with
          persistent memory in Claude Code, combining the <em>Beads</em> task
          manager (<ArticleCode>bd</ArticleCode>) and <em>Beads Viewer</em> (
          <ArticleCode>bv</ArticleCode>).
        </>
      }
    >
      {/* Introduction */}
      <ArticleSection>
        <ArticleSubheading>
          Long-Horizon Tasks with Persistent Memory
        </ArticleSubheading>

        <ArticleParagraph>
          Beads is an ultralight task management system designed for AI-assisted
          development workflows. It replaces default task managers with a
          persistent, observable layer that tracks work across sessions and
          context compactions.
        </ArticleParagraph>

        <ArticleParagraph>
          The main motivation behind Beads is to replace the default task
          manager used by Claude and allow it to track tasks with persistent
          memory. The memory improvement has been verified by many, so I
          won&apos;t get into that much in this write-up. Instead, I&apos;ll
          show you my workflow and propose a new way to plan long-horizon tasks
          using <ArticleCode>bd</ArticleCode> with labels and coordinate them
          with detailed insights using <ArticleCode>bv</ArticleCode>. You can
          even use Beads to track planning sessions, codebase deep-dives, and
          more. Its format allows for tremendous utility for humans in the
          loop. You can develop your own workflows around these tools while they
          provide the base observability needed into work done and ways to
          execute prompts.
        </ArticleParagraph>

        <ArticleParagraph>
          <ArticleCode>bd</ArticleCode> (beads) is a drop-in replacement for
          native task runners like <ArticleCode>TodoWrite</ArticleCode>. Same
          interface, but with a persistent memory layer underneath.{" "}
          <ArticleCode>bv</ArticleCode> (beads viewer) visualizes the task
          graph, shows progress across phases, and lets you navigate
          dependencies interactively. Lightweight, significant memory savings.
        </ArticleParagraph>
      </ArticleSection>

      {/* Setup */}
      <ArticleSection>
        <ArticleHeading>Setup</ArticleHeading>

        <ArticleParagraph>
          Setup is straightforward. Literally just copy and enter the curl links
          that install the tools. Then add the Beads marketplace plugin, run{" "}
          <ArticleCode>bd init</ArticleCode>, and update{" "}
          <ArticleCode>claude.md</ArticleCode>/
          <ArticleCode>agents.md</ArticleCode> to include instructions on using
          Beads as the default task manager and <ArticleCode>bv</ArticleCode>{" "}
          for condensed insights.
        </ArticleParagraph>

        <ArticleCode inline={false}>
          {`# Install bd (beads CLI)
curl -fsSL https://raw.githubusercontent.com/kraitsura/beads/main/install.sh | bash

# Install bv (beads viewer)
curl -fsSL https://raw.githubusercontent.com/kraitsura/beads-viewer/main/install.sh | bash

# Add the marketplace plugin for Claude Code
/plugin marketplace add beads`}
        </ArticleCode>

        <ArticleParagraph>
          I personally built from source in a forked repo and symlinked my build
          output to PATH so I could actively customize my workflow. I recommend
          you do the same if you want fine-grained control.
        </ArticleParagraph>

        <ArticleParagraph>
          In normal flows (building simple features), Beads works automatically
          in the background of your requests. You end up with the task completed
          along with a trail of completed beads explaining the tasks performed.
          This creates an automatic audit trail that survives compaction and
          session boundaries.
        </ArticleParagraph>

        <ArticleParagraph>
          This is the core value prop: an audit trail that survives compaction.
          When Claude&apos;s context fills up and gets compressed, the beads
          remain. You can pick up any session and immediately see what was
          done, what failed, and what&apos;s left.
        </ArticleParagraph>
      </ArticleSection>

      {/* Small Example */}
      <ArticleSection>
        <ArticleHeading>Small Example</ArticleHeading>

        <ArticleParagraph>
          In the following example, I tasked Claude with planning and building a
          new TUI dashboard view for the interactive Beads viewer tool that
          allows users to coordinate long-horizon tasks. I wanted something that
          organized tasks by labels, sorted by dependencies, and had a clean
          viewer for finished, ongoing, and future tasks. My main goal was to
          create something that helped me pick up where I left off between
          sessions.
        </ArticleParagraph>

        <ArticleParagraph>
          If you&apos;ve ever started a new Claude session and spent 10 minutes
          re-explaining context, you know the pain. Beads fixes this. The task
          state <em>is</em> the context. Point Claude at a bead and it knows
          exactly what&apos;s been done and what&apos;s next.
        </ArticleParagraph>

        <ArticleParagraph>
          We started with this plan: 1 epic and approximately 20 tasks.
        </ArticleParagraph>

        <ArticleImagePlaceholder caption="INSERT SCREENSHOT: Initial plan showing epic and task structure" />

        <ArticleParagraph>
          This was the result of phase 1, after one conversation with 90%
          context utilization.
        </ArticleParagraph>

        <ArticleImagePlaceholder caption="INSERT SCREENSHOT: Completed phase 1 results" />

        <ArticleParagraph>
          I encountered some bugs, so I compacted and started squashing them
          while tracking the issues in Beads along the way:
        </ArticleParagraph>

        <ArticleCode inline={false}>
          {`we have a problem in the labels viewer selector, when we search and select
highlight it chooses incorrectly, track issue under labels viewer epic with
phase1 label as you fix it.`}
        </ArticleCode>

        <ArticleParagraph>
          Notice the conversational phrasing, no special syntax required. You
          just describe what&apos;s wrong and where to track it. Claude handles
          the <ArticleCode>bd create</ArticleCode> and dependency wiring.
        </ArticleParagraph>

        <ArticleParagraph>
          While this was working on itself, I had ideas about quality-of-life
          updates to the dashboard that would make it more useful. So I tasked
          Claude with adding a new phase to the epic for QoL updates and
          creating beads under it. I could then implement these plans whenever I
          wanted. Since the shape of the dashboard was still nascent and I was
          still experimenting with the workflow, I decided to just dump some
          ideas for later. They would be unblocked by the previous phases and
          always ready for work (unless the feature depended on future work from
          phases 2–4).
        </ArticleParagraph>

        <ArticleCode inline={false}>
          {`Add phase 5 to the labels viewer epic focused on quality of life updates.
The first feature is a keyboard shortcut where pressing p while hovering
over an issue in the labels viewer copies a prompt to the clipboard. The
prompt should be concise and include the issue id along with instructions
to get started working on it. Create the necessary beads for this feature.`}
        </ArticleCode>

        <ArticleParagraph>
          This is beads as an idea parking lot. Unlike plain notes, these ideas
          have structure. They&apos;re proper tasks with dependencies. When
          phase 4 finishes, phase 5 tasks automatically become unblocked and
          show up in <ArticleCode>bd ready</ArticleCode>. The ideas wait for
          their moment.
        </ArticleParagraph>

        <ArticleParagraph>
          Once my phase 1 fixes were done, this was the end result:
        </ArticleParagraph>

        <ArticleImagePlaceholder caption="INSERT SCREENSHOT: Completed phase 1 with fixes" />

        <ArticleParagraph>
          We can still see that some things were missing. I wanted a built-in
          task viewer that uses the main <ArticleCode>bv</ArticleCode> task view
          TUI. I added this as a quick feature to QoL and ran phase 5 beads in a
          parallel git worktree:
        </ArticleParagraph>

        <ArticleImagePlaceholder caption="INSERT SCREENSHOT: Task viewer implementation" />

        <ArticleParagraph>
          Now I have a nice task viewer to view my phase 2 tasks:
        </ArticleParagraph>

        <ArticleImagePlaceholder caption="INSERT SCREENSHOT: Phase 2 task view" />
      </ArticleSection>

      {/* Working with Resistance */}
      <ArticleSection>
        <ArticleHeading>Working with Resistance and Iteration</ArticleHeading>

        <ArticleParagraph>
          I&apos;ll admit the process needs some coaxing. It doesn&apos;t always
          go the way you want, and you need to cajole Claude along the way. But
          that&apos;s fine given the benefits. The system will only get more
          seamless as both tools improve.
        </ArticleParagraph>

        <ArticleParagraph>
          The key insight: the coaxing itself gets recorded. When you redirect
          Claude, when you clarify scope, when you reject an approach, all of
          that becomes part of the bead&apos;s history. Future sessions inherit
          those refinements.
        </ArticleParagraph>

        <ArticleParagraph>
          As I progressed through the implementation, a few nice workflows
          emerged. I faced significant resistance in phase 2 due to my original
          implementation scope being misguided and insufficient. While I was
          conversing with the agent about the situation, whenever we made
          progress in the conversation, I could easily reopen finished tasks,
          create new beads that represented some small implementation detail
          Claude and I were both happy with, and repeat this process several
          times across multiple conversations.
        </ArticleParagraph>

        <ArticleParagraph>
          Whenever I started new conversations, I would use a bead to add
          context and continue asking questions or figuring out my
          implementation. This felt fairly liberating.
        </ArticleParagraph>

        <ArticleParagraph>
          Beads become conversation anchors. Instead of &quot;continue where we
          left off&quot; and hoping Claude remembers, you say &quot;pick up
          bd-47&quot; and the full context is there. The bead <em>is</em> the
          shared memory between sessions.
        </ArticleParagraph>

        <ArticleParagraph>
          On the flip side, I was continuing with my QoL updates in parallel
          using a git worktree that branched off the post-phase-1 commits. As
          tasks were completed, I had more QoL ideas, and I repeated my workflow
          of using beads as points of context that allow humans to finely enter
          the agentic loop and direct as we want.
        </ArticleParagraph>

        <ArticleParagraph>
          I felt I had more control over leading conversations, and the entire
          parallel stream was done in a single conversation (with 3 compacts, so
          technically 4 conversations). Some ideas didn&apos;t take, we used
          beads to revert safely. Some ideas led to more, we used beads to track
          these thoughts and execute after compacts. I even had ideas in the
          other phases that I asked Claude to create in the same conversation
          (Claude at this point was still in the root folder while working in{" "}
          <ArticleCode>.worktrees/phase5-qol</ArticleCode>), so that was made
          effortless.
        </ArticleParagraph>

        <ArticleParagraph>
          The parallel worktree pattern works well here: main branch handles
          phases 1-4, worktree handles phase 5 QoL. Beads tracks both streams
          from a single database in the root. You can see all work in one{" "}
          <ArticleCode>bv</ArticleCode> view regardless of which git context
          you&apos;re in.
        </ArticleParagraph>

        <ArticleParagraph>
          Once phase 2 was completed, I merged the QoL feature branch onto my
          main local branch, committed, and carried on with phases 3–4. I
          won&apos;t bore you with the details, but we ended with a complete
          (unoptimized) implementation after around 50 beads over 5 phases. It
          took me around 2 days. Phase 2 took the longest. I had to redesign the
          heuristic partitioning multiple times, and I&apos;m still not fully
          happy with it, but it&apos;s good enough for now.
        </ArticleParagraph>
      </ArticleSection>

      {/* My Personal Workflow */}
      <ArticleSection>
        <ArticleHeading>My Personal Workflow</ArticleHeading>

        <ArticleParagraph>
          Here&apos;s how I actually use this stuff day-to-day.
        </ArticleParagraph>

        <ArticleParagraph>
          I&apos;ve created a skill to turn large plans into beads for when I
          bring in plans from outside Claude Code during large planning sessions
          in markdown. This does a clean job of digesting enormous markdown
          files into beads with proper structure. But the point of Beads is to
          embrace it as the default task manager, not just as an import tool.
        </ArticleParagraph>

        <ArticleParagraph>
          The skill encodes my personal conventions: labeling rules, phase and
          scope specifications, guards against circular dependencies, that sort
          of thing. Using it gives me task graphs shaped exactly the way I
          think about work.
        </ArticleParagraph>

        <ArticleParagraph>
          I forked the Beads repo and replaced my local install. To it, I added
          flags on commonly used commands for more verbose return statements.
          During runs, I noticed commands like <ArticleCode>show</ArticleCode>,{" "}
          <ArticleCode>list</ArticleCode>, and <ArticleCode>ready</ArticleCode>{" "}
          returned a lot of content when it wasn&apos;t needed. For example,
          mid-flow, if Claude needs to check the dependencies of a task to find
          an issue and then check its description, we need a way to only see the
          relevant information we want. Additionally, the plugin commands
          weren&apos;t able to scope commands like{" "}
          <ArticleCode>ready</ArticleCode> and <ArticleCode>list</ArticleCode>,
          so I added those flags as well for the MCP plugin and uploaded it to
          the marketplace.
        </ArticleParagraph>

        <ArticleParagraph>
          The consolidated plugin achieves ~88% token reduction on response
          output and ~50% reduction in system prompt overhead through:
        </ArticleParagraph>

        <ArticleList ordered>
          <li>Verbose-by-default write ops → brief confirmations</li>
          <li>
            <ArticleCode>brief=True</ArticleCode> for reads → {"{id, title, status}"}{" "}
            only
          </li>
          <li>
            <ArticleCode>fields</ArticleCode> parameter → selective output
          </li>
          <li>23→11 tool consolidation → smaller system prompt</li>
          <li>
            New filters (<ArticleCode>labels</ArticleCode>,{" "}
            <ArticleCode>labels_any</ArticleCode>,{" "}
            <ArticleCode>query</ArticleCode>) → fewer round-trips
          </li>
        </ArticleList>

        <ArticleParagraph>
          For large epics the effects are obvious. I will create a PR for all
          this soon, but until then if you want to test it out yourself to see
          the difference, you can use{" "}
          <ArticleCode>/plugin marketplace add kraitsura/beads</ArticleCode> and
          install the plugin. I will do a separate write-up on this later.
        </ArticleParagraph>
      </ArticleSection>

      {/* What You Can Do With Beads */}
      <ArticleSection>
        <ArticleHeading>Some Cool Things We Can Do</ArticleHeading>

        <ArticleHeading level={3}>Dependency Analysis</ArticleHeading>
        <ArticleList>
          <li>
            <strong>Trace implementation history</strong> - Follow the chain of
            discovered-from links to see how work actually unfolded, not just
            what was planned.
          </li>
          <li>
            <strong>Find root causes</strong> - When a bug appears, trace
            backwards to the original feature to find related issues and
            understand what else might break.
          </li>
          <li>
            <strong>Review closed work</strong> - Check if all discovered issues
            are also closed before marking a feature complete. No more hidden
            loose ends.
          </li>
        </ArticleList>

        <ArticleHeading level={3}>Context Gathering</ArticleHeading>
        <ArticleList>
          <li>
            <strong>Point agents to specific beads</strong> - Instead of
            explaining context, just reference{" "}
            <ArticleCode>bd-epic-auth</ArticleCode> and let the agent pull all
            related tasks, blockers, and history.
          </li>
          <li>
            <strong>View upstream dependencies</strong> - Trace blocking issues
            to find where assumptions went wrong in the implementation chain.
          </li>
          <li>
            <strong>Get full context trees</strong> - Use{" "}
            <ArticleCode>bd show --with-children</ArticleCode> to grab an epic
            plus all child tasks in one command.
          </li>
        </ArticleList>

        <ArticleHeading level={3}>Work Discovery</ArticleHeading>
        <ArticleList>
          <li>
            <strong>Find forgotten work</strong> - Query for issues that
            haven&apos;t been touched in 30 days or high-priority items with no
            recent progress.
          </li>
          <li>
            <strong>Detect scope creep</strong> - Count discovered issues per
            epic to spot features that are ballooning beyond original scope.
          </li>
          <li>
            <strong>Smart ready queues</strong> - Get unblocked work filtered by
            label, priority, or assignee so agents grab the right tasks.
          </li>
        </ArticleList>

        <ArticleHeading level={3}>Multi-Agent Coordination</ArticleHeading>
        <ArticleList>
          <li>
            <strong>Claim work to avoid conflicts</strong> - Agents mark issues
            as <ArticleCode>in_progress</ArticleCode> so others skip them in
            ready queries.
          </li>
          <li>
            <strong>Hand off between specialists</strong> - Frontend agent
            discovers backend work, creates it with discovered-from link and
            assigns to backend agent.
          </li>
          <li>
            <strong>Parallel work distribution</strong> - Find tasks with no
            shared blockers and distribute across multiple agents
            simultaneously.
          </li>
        </ArticleList>

        <ArticleHeading level={3}>Quality Gates</ArticleHeading>
        <ArticleList>
          <li>
            <strong>Block merges on open work</strong> - CI fails if any
            discovered issues from an epic remain open. Forces cleanup before
            shipping.
          </li>
          <li>
            <strong>Track critical paths</strong> - Use dependency chains to
            find the longest path to completion and identify bottlenecks.
          </li>
          <li>
            <strong>Audit who did what</strong> - See complete history of
            assignments, status changes, and handoffs across agents.
          </li>
        </ArticleList>

        <ArticleHeading level={3}>Cool Workflows</ArticleHeading>
        <ArticleList>
          <li>
            <strong>Sub-agent pattern</strong> - Main agent creates tasks and
            assigns to specialized sub-agents (e.g.,{" "}
            <ArticleCode>--assignee agent-db-optimizer</ArticleCode>). Each
            works on their queue independently.
          </li>
          <li>
            <strong>Test-driven development</strong> - Create test task first,
            then implementation task that blocks on tests. Agent automatically
            works on tests first.
          </li>
          <li>
            <strong>Landing the plane</strong> - End every session with{" "}
            <ArticleCode>bd sync</ArticleCode> to commit work, preventing loss
            across sessions. Beads becomes persistent agent memory.
          </li>
          <li>
            <strong>Rolling deployments</strong> - Tag deployment with{" "}
            <ArticleCode>bd create &quot;Deploy v2.0&quot;</ArticleCode>. Bugs
            discovered get{" "}
            <ArticleCode>--discovered-from deploy-id</ArticleCode> for easy
            rollback tracking.
          </li>
          <li>
            <strong>Doc debt automation</strong> - Script that finds closed
            features without docs, auto-creates doc tasks with discovered-from
            link to feature.
          </li>
        </ArticleList>
      </ArticleSection>

      {/* Showcase */}
      <ArticleSection>
        <ArticleHeading>Showcase</ArticleHeading>

        <ArticleParagraph>
          Here I tackle a brand new project with Beads, Beads Viewer, and the
          Ralph Wiggum plugin for loops in Claude Code. This will showcase an
          end-to-end self-referential coding session that you don&apos;t need to
          lift a finger for after extensively planning. Here you can see we made
          a pretty comprehensive plan with Beads:
        </ArticleParagraph>

        <ArticleImagePlaceholder caption="INSERT SCREENSHOT: Comprehensive plan with Beads" />

        <ArticleParagraph>
          This is my latest workflow. The Ralph Wiggum iterations act as
          coordination layers that use agents to delegate tasks. With this
          method alone I saw a massive efficiency boost in token usage. Here is
          the prompt I use:
        </ArticleParagraph>

        <ArticleImagePlaceholder caption="INSERT: Ralph Wiggum prompt configuration" />

        <ArticleParagraph>
          Mind you, the Ralph Wiggum plugin is severely broken and honestly
          quite rough around the edges. It doesn&apos;t account for edge cases,
          you have no visibility, and everything relies on a hail mary. I only
          discovered that you can in fact tap into headless Claude Code
          sessions, only it was entirely too late. For the most persistent
          error, here is the fix:{" "}
          <ArticleLink href="https://github.com/anthropics/claude-code/pull/12642">
            github.com/anthropics/claude-code/pull/12642
          </ArticleLink>
          . Ensure that your stop hook is responsibly working before you begin
          testing it out.
        </ArticleParagraph>

        <ArticleParagraph>
          After I set the loop on, I basically just tracked completion in the
          custom labels viewer we built earlier and watched the progress bar
          fill up:
        </ArticleParagraph>

        <ArticleImagePlaceholder caption="INSERT SCREENSHOT: Progress tracking in labels viewer" />

        <ArticleParagraph>
          This was the most satisfying part, and it felt like a week&apos;s
          worth of hard work had culminated into this moment. I hacked on all
          three tools to get to a point where I felt happy with my workflow.
        </ArticleParagraph>
      </ArticleSection>

      {/* Conclusion */}
      <ArticleSection>
        <ArticleHeading>Conclusion</ArticleHeading>

        <ArticleParagraph>
          Beads solves the context problem. Your task state persists across
          compactions, sessions, and even machines (via git sync). The
          label-based partitioning adapts to however you work, no conventions
          forced. Parallel worktrees let you run multiple development streams
          with unified visibility.
        </ArticleParagraph>

        <ArticleParagraph>
          The real win is control. You can enter the loop at any bead, redirect
          work, park ideas for later, and always know exactly where things
          stand. The observability layer makes AI-assisted development
          something you direct rather than something that happens to you.
        </ArticleParagraph>

        <ArticleParagraph>
          Links:{" "}
          <ArticleLink href="https://github.com/kraitsura/beads">
            github.com/kraitsura/beads
          </ArticleLink>{" "}
          (my fork with verbose flags),{" "}
          <ArticleLink href="https://github.com/kraitsura/beads-viewer">
            github.com/kraitsura/beads-viewer
          </ArticleLink>{" "}
          (the TUI). For the marketplace plugin with token optimizations:{" "}
          <ArticleCode>/plugin marketplace add kraitsura/beads</ArticleCode>.
        </ArticleParagraph>
      </ArticleSection>
    </ArticleLayout>
  );
}
