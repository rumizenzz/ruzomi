import type { DocPage, DocsSearchResult } from "@/lib/types";

export const developerPortalPages: DocPage[] = [
  {
    slug: ["account-access"],
    group: "Start Here",
    title: "Developer Accounts and Workspaces",
    eyebrow: "Access",
    summary:
      "How teams sign in, create a workspace, request sandbox access, and move toward production.",
    searchTerms: [
      "developer accounts",
      "workspace",
      "login",
      "signup",
      "sandbox access",
      "production access",
      "platform account",
    ],
    sections: [
      {
        id: "who-signs-in",
        title: "Who signs in",
        body: [
          "Platform access is built for the people who run the integration day to day: developers, technical leads, security owners, and billing or compliance contacts.",
          "Each organization can invite the right people into the workspace without collapsing docs, API access, billing, and customer review into one shared login.",
        ],
      },
      {
        id: "workspace-flow",
        title: "Workspace flow",
        body: [
          "Create an account, request sandbox access, issue the first key, connect a webhook, and review usage from the same workspace.",
          "The goal is simple: keep account access, approvals, reporting, and integration history easy to find from the start instead of hiding them behind email threads.",
        ],
      },
      {
        id: "production-readiness",
        title: "From sandbox to production",
        body: [
          "Approved organizations move from sandbox to production through consent review, billing setup, integration verification, and audit-ready checks.",
          "The portal keeps those stages explicit so teams always know whether they are reading public docs, working in sandbox, or using production credentials.",
        ],
      },
    ],
  },
  {
    slug: ["account-access", "first-workspace-run"],
    group: "Start Here",
    title: "First Workspace Run",
    eyebrow: "Access detail",
    summary:
      "The first signed-in platform path from account creation through organization attachment and workspace ownership.",
    searchTerms: [
      "first workspace run",
      "account onboarding",
      "workspace attach",
      "developer sign in flow",
      "first platform login",
    ],
    sections: [
      {
        id: "account-first",
        title: "Account first",
        body: [
          "The platform should make it clear that a developer starts with a normal PayToCommit account, then attaches that account to a real organization workspace with explicit owners and operating lanes.",
          "That mirrors the way serious developer platforms work: identity first, workspace second, protected usage only after the workspace is real.",
        ],
      },
      {
        id: "workspace-attach",
        title: "Workspace attach",
        body: [
          "The first workspace run should show who is becoming the technical owner, who is expected to handle billing, and which use case is driving the initial project request.",
          "This avoids the common problem where a team creates a workspace but no one can later explain who owns the integration.",
        ],
      },
      {
        id: "first-hour",
        title: "First-hour next steps",
        body: [
          "Once the account is attached, the next steps should be obvious: create the first sandbox project, issue the first key, run a protected lookup, and move into production review only when the basics are proven.",
          "A strong first-run page should feel like an operator checklist, not a generic welcome screen.",
        ],
      },
    ],
    codeSample: {
      title: "First workspace run payload",
      language: "json",
      code: `{
  "workspace_id": "ws_northstar_platform",
  "viewer_role": "technical_owner",
  "organization_attach_state": "complete",
  "next_steps": ["create_project", "issue_key", "run_first_lookup"]
}`,
      note: "The first workspace run should connect account identity, organization ownership, and the next operational steps in one place.",
    },
  },
  {
    slug: ["organizations"],
    group: "Workspace",
    title: "Organizations and Workspace Access",
    eyebrow: "Workspace",
    summary:
      "Create an organization, invite the right people, and keep sandbox and production separated cleanly.",
    searchTerms: [
      "organization",
      "workspace access",
      "members",
      "billing owner",
      "developer seat",
      "team access",
      "roles",
    ],
    sections: [
      {
        id: "organization-setup",
        title: "Organization setup",
        body: [
          "A workspace starts with an organization record that identifies who owns the integration, who manages billing, and who manages keys, reports, and webhooks.",
          "That matches the way real engineering teams work: technical owners, security owners, and billing owners can all have the right view without sharing one login.",
        ],
      },
      {
        id: "roles-and-separation",
        title: "Roles and separation",
        body: [
          "Workspace roles keep access understandable. Sandbox reviewers, production managers, and billing or audit stakeholders can all work inside the same organization with the right boundary.",
          "The platform keeps those boundaries visible instead of burying them behind support tickets or hidden admin state.",
        ],
      },
      {
        id: "account-entry",
        title: "Account entry",
        body: [
          "Developers create a normal PayToCommit account first, then attach that account to an organization workspace. Enterprise onboarding, key issuance, reporting, and webhook operations all happen after that first sign-in.",
          "This mirrors the way serious API platforms work: account first, workspace second, production approval last.",
        ],
      },
    ],
  },
  {
    slug: ["organizations", "northstar-logistics"],
    group: "Workspace",
    title: "Organization Detail",
    eyebrow: "Organization detail",
    summary:
      "A full workspace view of owners, production state, workforce rollout readiness, and the projects tied to one organization.",
    searchTerms: [
      "organization detail",
      "workspace detail",
      "owners",
      "northstar logistics",
      "org dashboard",
    ],
    sections: [
      {
        id: "owners-and-boundaries",
        title: "Owners and boundaries",
        body: [
          "The organization detail page should show technical, billing, audit, and workforce owners together so the workspace boundary is visible before anyone reaches for a key or export.",
          "That keeps ownership legible under real operational pressure instead of hiding critical roles behind generic member lists.",
        ],
      },
      {
        id: "projects-and-rollouts",
        title: "Projects and rollout links",
        body: [
          "One organization can hold several projects, workforce launches, and payroll-linked wallet programs. The detail page should make those lanes easy to compare and open from a single workspace view.",
          "This is where operators should see whether the company is still sandbox-only, ready for production, or already carrying live protected usage.",
        ],
      },
      {
        id: "policy-state",
        title: "Policy and approval state",
        body: [
          "Organization detail should keep production review, webhook health, key hygiene, and consent expectations visible from the same page so the workspace can move forward without another approval tracker.",
          "That is the difference between a serious platform workspace and a static documentation hub.",
        ],
      },
    ],
    codeSample: {
      title: "Organization workspace detail",
      language: "json",
      code: `{
  "organization_id": "org_northstar_logistics",
  "workspace_state": "production_ready",
  "owners": {
    "technical": "devops@northstar.example",
    "billing": "finance@northstar.example",
    "audit": "compliance@northstar.example",
    "workforce": "ops@northstar.example"
  },
  "projects": 4,
  "active_rollouts": 3,
  "payroll_programs": 1
}`,
      note: "An organization detail page should combine ownership, rollout depth, and project posture in one operator view.",
    },
  },
  {
    slug: ["roles-permissions"],
    group: "Organization Operations",
    title: "Roles and Permissions",
    eyebrow: "Org controls",
    summary:
      "Define owner, admin, manager, analyst, employee, and contractor access without collapsing the organization into one permission set.",
    searchTerms: [
      "roles and permissions",
      "organization roles",
      "manager permissions",
      "employee permissions",
      "admin roles",
      "workspace roles",
    ],
    sections: [
      {
        id: "role-boundaries",
        title: "Role boundaries",
        body: [
          "Organization access should be explicit. Owners handle policy and billing, admins run rollout and approvals, managers review employee activity, analysts inspect reporting, and employees stay inside the views their role actually needs.",
          "That keeps the enterprise workspace legible under real operating pressure and avoids the common failure mode where every person gets broad access because the system cannot express narrower lanes.",
        ],
      },
      {
        id: "scoped-work",
        title: "Scoped work instead of one giant admin lane",
        body: [
          "Roles should shape what can be opened, what can be edited, and which alerts can be resolved. Employee approvals, billing exports, customer review, payroll rollout, and organization markets do not all belong to the same role by default.",
          "The workspace should make those boundaries visible before anyone sends invites or changes visibility policy so the company understands who is allowed to do what.",
        ],
      },
      {
        id: "permission-audit",
        title: "Permission audit trail",
        body: [
          "Every role change, scope reduction, and grant should stay tied to an audit event. That matters most during workforce launch, revocation, and restoration because the company needs a clean record of why access changed and who approved it.",
          "A strong permission page does not just list roles. It explains the operational consequences of those roles and keeps that explanation attached to the current organization state.",
        ],
      },
    ],
    codeSample: {
      title: "Organization role matrix",
      language: "json",
      code: `{
  "organization_id": "org_northstar_logistics",
  "roles": [
    "OrganizationOwner",
    "OrganizationAdmin",
    "Manager",
    "Analyst",
    "Employee"
  ],
  "permission_groups": {
    "approvals": ["OrganizationOwner", "OrganizationAdmin", "Manager"],
    "billing_exports": ["OrganizationOwner", "OrganizationAdmin", "Analyst"],
    "employee_detail": ["OrganizationOwner", "OrganizationAdmin", "Manager"],
    "workspace_settings": ["OrganizationOwner", "OrganizationAdmin"]
  }
}`,
      note: "Roles should stay explicit, auditable, and tied directly to operating surfaces instead of hiding behind one shared admin state.",
    },
  },
  {
    slug: ["roles-permissions", "manager-control-pack"],
    group: "Organization Operations",
    title: "Manager Control Pack",
    eyebrow: "Role detail",
    summary:
      "The scoped manager permission pack for team review, employee detail, approvals, continuity action, and organization-market oversight.",
    searchTerms: [
      "manager control pack",
      "manager permission pack",
      "team manager permissions",
      "manager role detail",
      "org manager controls",
    ],
    sections: [
      {
        id: "manager-scope",
        title: "What managers can do",
        body: [
          "Managers need a narrow but powerful lane. They can review employee detail, handle team approvals, respond to continuity pressure, and monitor organization-market participation for their own teams.",
          "They should not inherit the full workspace just because they need one operational slice. That boundary is what keeps the organization usable at real scale.",
        ],
      },
      {
        id: "manager-boundaries",
        title: "What managers cannot do by default",
        body: [
          "Managers do not need unrestricted billing, unrestricted tenant settings, or broad audit-export authority by default. Those remain owner, admin, or analyst lanes unless policy expands them.",
          "A good manager permission pack makes the allowed lane strong enough to operate daily without letting it collapse into one giant admin role.",
        ],
      },
      {
        id: "why-this-pack-exists",
        title: "Why this pack exists",
        body: [
          "This detail page exists so org admins can explain exactly why a manager has a specific scope. That matters when visibility policy, continuity protections, and employee trust all depend on clear boundaries.",
          "The manager pack should feel like a deliberate operational role, not a vague subset of admin access.",
        ],
      },
    ],
    codeSample: {
      title: "Manager control pack",
      language: "json",
      code: `{
  "role": "Manager",
  "permissions": [
    "employee.detail.team_scoped",
    "approval.review.team_scoped",
    "continuity.restore.team_scoped",
    "org_market.monitor.team_scoped"
  ],
  "restricted_permissions": [
    "billing.export.global",
    "workspace.settings.global",
    "api_key.manage.global"
  ]
}`,
      note: "A manager control pack should be strong enough to run a team lane without collapsing into full workspace admin access.",
    },
  },
  {
    slug: ["organization-hrs"],
    group: "Organization Operations",
    title: "Organization HRS Analytics",
    eyebrow: "Integrity analytics",
    summary:
      "Review organization-level reliability, queue pressure, recoveries, and continuity behavior from one analytics surface.",
    searchTerms: [
      "organization hrs",
      "organization integrity score",
      "org analytics",
      "org recoveries",
      "queue pressure",
      "reliability analytics",
    ],
    sections: [
      {
        id: "org-score-shape",
        title: "What the organization score reflects",
        body: [
          "Organization HRS should not behave like a vanity badge. It should show how reliably the company handles its own rollout, approvals, continuity obligations, and organization-market participation over time.",
          "That means the analytics surface needs gains, dips, recoveries, and plateaus, not just one flat number detached from real operating events.",
        ],
      },
      {
        id: "pressure-signals",
        title: "Where pressure comes from",
        body: [
          "Approval delays, blocked employees with active commitments, continuity protection windows, and unresolved org-market misses should all be visible in the organization analytics lane where policy allows.",
          "The goal is to make trust operational. A company should be able to see whether its own management behavior is helping or hurting the employee commitment system it asked people to join.",
        ],
      },
      {
        id: "manager-actions",
        title: "What managers do next",
        body: [
          "Good analytics pages route directly into the queue, roster, continuity, and market lanes that can improve the score. This should feel like an operating surface for improvement, not an inert dashboard.",
          "That also makes the score explainable. The company can see what changed, why it changed, and which next action is most likely to improve the trend.",
        ],
      },
    ],
    codeSample: {
      title: "Organization HRS trend payload",
      language: "json",
      code: `{
  "organization_id": "org_northstar_logistics",
  "hrs": 83,
  "trend": "recovering",
  "active_pressures": {
    "pending_employee_approvals": 18,
    "continuity_protection_windows": 7,
    "org_market_misses": 2
  },
  "recent_events": [
    "approval_backlog_cleared",
    "continuity_access_restored",
    "department_launch_completed"
  ]
}`,
      note: "Organization HRS should be driven by visible operating signals and explainable improvement paths.",
    },
  },
  {
    slug: ["organization-alerts"],
    group: "Organization Operations",
    title: "Organization Alerts and Notifications",
    eyebrow: "Org alerts",
    summary:
      "Track approval backlog, continuity risk, org-market deadlines, payroll rollout drift, and operator follow-up from one alert center.",
    searchTerms: [
      "organization alerts",
      "organization notifications",
      "approval backlog alerts",
      "continuity risk alerts",
      "org deadlines",
      "operator notifications",
    ],
    sections: [
      {
        id: "alert-lanes",
        title: "Alert lanes that matter",
        body: [
          "Organization alerts should group approval backlog, continuity deadlines, org-market launch changes, payroll rollout drift, and reporting readiness into clear operating lanes.",
          "That keeps the workspace actionable instead of turning into one noisy stream of unrelated notifications.",
        ],
      },
      {
        id: "lightweight-operator-signal",
        title: "Compact but high-signal",
        body: [
          "The alert center should stay compact and calm. Operators need to understand what changed, how urgent it is, and where to go next without reading a wall of status text.",
          "This is where good enterprise tooling feels refined: strong grouping, clear severity, direct routing, and no wasted motion.",
        ],
      },
      {
        id: "alert-auditability",
        title: "Alert history and routing",
        body: [
          "Alerts should stay tied to the organization, the affected workflow, and the next owner. They also need a record of when they opened, who resolved them, and whether the same issue is repeating.",
          "That turns notifications into an operational memory instead of a disposable inbox.",
        ],
      },
    ],
    codeSample: {
      title: "Organization alert summary",
      language: "json",
      code: `{
  "organization_id": "org_northstar_logistics",
  "alerts": {
    "approval_backlog": 4,
    "continuity_deadlines": 3,
    "payroll_rollout_gaps": 2,
    "org_market_schedule_changes": 1
  },
  "next_owner": "ops@northstar.example"
}`,
      note: "Organization alerts should stay grouped, assigned, and directly connected to the workflow that can resolve them.",
    },
  },
  {
    slug: ["organization-alerts", "continuity-pressure"],
    group: "Organization Operations",
    title: "Continuity Pressure Alert",
    eyebrow: "Alert detail",
    summary:
      "A focused alert lane for restore deadlines, active commitments at risk, and the org actions needed to protect continuity access.",
    searchTerms: [
      "continuity pressure",
      "restore deadline alert",
      "active commitment risk",
      "continuity alert detail",
      "organization restore pressure",
    ],
    sections: [
      {
        id: "why-this-alert-opens",
        title: "Why this alert opens",
        body: [
          "Continuity pressure opens when an employee has active commitments and the organization has reduced or is trying to reduce the broader workspace access they would normally use.",
          "The system should keep the employee inside the minimum required commitment lane, but the organization still needs to restore or resolve the broader situation before deadlines stack up.",
        ],
      },
      {
        id: "what-operators-review",
        title: "What operators review",
        body: [
          "Operators should see the employee, the manager or admin owner, the active deadlines, and the minimum continuity lane still available to the employee.",
          "That lets the organization act on the real problem instead of treating the alert like an abstract policy warning.",
        ],
      },
      {
        id: "what-happens-next",
        title: "What happens next",
        body: [
          "The alert should route directly into restore access, queue review, or employee detail. It should never end as a dead message with no owner or next action.",
          "This is the kind of detail that makes the org workspace feel operationally complete instead of decorative.",
        ],
      },
    ],
    codeSample: {
      title: "Continuity pressure payload",
      language: "json",
      code: `{
  "organization_id": "org_northstar_logistics",
  "alert_type": "continuity_pressure",
  "active_employees": 7,
  "nearest_restore_deadline": "2026-03-15T16:00:00Z",
  "linked_queue_window": "northstar-q1-access-window"
}`,
      note: "Continuity alerts should tie deadlines, queue ownership, and employee protection into one clear operating record.",
    },
  },
  {
    slug: ["organization-workspace"],
    group: "Organization Operations",
    title: "Organization Workspace",
    eyebrow: "Workspace control",
    summary:
      "The central operating view for company-managed employees, approvals, org markets, continuity protection, payroll rollout, and manager-owned team lanes.",
    searchTerms: [
      "organization workspace",
      "enterprise dashboard",
      "employee operations center",
      "org workspace",
      "company-managed workspace",
      "team operations",
    ],
    sections: [
      {
        id: "workspace-purpose",
        title: "What the organization workspace is for",
        body: [
          "The organization workspace is where a company actually runs its PayToCommit program. Employee approvals, manager team lanes, org-market launches, payroll-linked wallet rollout, and continuity protections should all be visible from one calm operating surface.",
          "This keeps the company from bouncing between separate admin stubs when the real job is to understand employee activity, restore safe access, and keep organization programs moving.",
        ],
      },
      {
        id: "workspace-lanes",
        title: "The lanes that belong together",
        body: [
          "The strongest workspace keeps the roster, queue, org markets, visibility policy, payroll-linked funding, and organization HRS pressure in one connected view. These are not unrelated subsystems; they shape the same employee experience.",
          "That means the workspace should route smoothly into employee detail, manager-scoped team views, program economics, and report lanes without losing the current organization context.",
        ],
      },
      {
        id: "workspace-standard",
        title: "What a serious organization workspace looks like",
        body: [
          "A serious workspace should feel like a real operating console: owner map, live queues, protected continuity states, launch health, payroll adoption, visibility posture, and next-step actions all visible at once.",
          "It should also stay compact. The goal is not to impress with surface area. The goal is to help managers and operators make the next correct decision quickly.",
        ],
      },
    ],
    codeSample: {
      title: "Organization workspace summary",
      language: "json",
      code: `{
  "organization_id": "org_northstar_logistics",
  "workspace_mode": "managed_operations",
  "employees": 842,
  "pending_approvals": 46,
  "continuity_windows": 7,
  "active_org_markets": 27,
  "payroll_programs": 1
}`,
      note: "The organization workspace should hold employee operations, org-market posture, and payroll-linked rollout in one place.",
    },
  },
  {
    slug: ["organization-workspace", "northstar-central-ops"],
    group: "Organization Operations",
    title: "Organization Workspace Detail",
    eyebrow: "Workspace detail",
    summary:
      "A live company workspace view with owner map, approval pressure, org-market health, payroll adoption, and next-step operating checkpoints.",
    searchTerms: [
      "organization workspace detail",
      "northstar central ops",
      "company dashboard",
      "enterprise operating console",
    ],
    sections: [
      {
        id: "owner-map",
        title: "Owner map and operating boundary",
        body: [
          "A workspace detail page should show the real owners first: technical, workforce, billing, audit, and team-management owners. That map needs to stay visible because all later approvals and corrections depend on it.",
          "Once the ownership map is clear, the page can safely layer in queue pressure, continuity windows, org-market launches, and payroll-linked funding without turning into a wall of disjointed metrics.",
        ],
      },
      {
        id: "current-pressure",
        title: "Current operating pressure",
        body: [
          "The detail page should make current pressure obvious: pending approvals, restricted employees with active commitments, upcoming org-market deadlines, and payroll rollout gaps. These are the issues that require action now.",
          "A good detail surface also keeps the next checkpoint visible so the workspace behaves like a real operating rhythm instead of a static analytics page.",
        ],
      },
      {
        id: "where-it-routes",
        title: "Where the workspace routes next",
        body: [
          "From the workspace detail page, operators should be able to move directly into employee detail, manager-owned team views, approval queues, organization economics, and report lanes without re-searching for context.",
          "That is what makes the workspace feel mature: the next correct path is always visible.",
        ],
      },
    ],
    codeSample: {
      title: "Organization workspace detail payload",
      language: "json",
      code: `{
  "workspace_id": "northstar_central_ops",
  "owner_map": {
    "technical": "devops@northstar.example",
    "workforce": "ops@northstar.example",
    "billing": "finance@northstar.example",
    "audit": "compliance@northstar.example"
  },
  "approval_pressure": 46,
  "continuity_windows": 7,
  "active_org_markets": 27,
  "next_checkpoint": "2026-03-18T13:00:00Z"
}`,
      note: "Workspace detail should combine owner map, pressure signals, and next routing actions.",
    },
  },
  {
    slug: ["manager-views"],
    group: "Organization Operations",
    title: "Manager Team Views",
    eyebrow: "Team operations",
    summary:
      "Manager-scoped team lanes for roster review, active commitments, unresolved misses, continuity windows, and org-market participation without granting full-owner access.",
    searchTerms: [
      "manager views",
      "team views",
      "manager dashboard",
      "employee team lane",
      "team operations",
      "manager scoped workspace",
    ],
    sections: [
      {
        id: "why-team-views-exist",
        title: "Why manager views exist",
        body: [
          "Managers usually need something narrower than the full organization console. They need to see their people, their active commitments, their missed work, and the next deadlines without also owning billing, key policy, or global admin settings.",
          "Manager team views give them that narrower operating lane so the organization can scale without turning every manager into a full administrator.",
        ],
      },
      {
        id: "what-managers-see",
        title: "What managers should see",
        body: [
          "A strong team view should show current roster, pending approvals assigned to that manager, current commitments, missed commitments, recoveries, continuity windows, and the team’s organization-market participation.",
          "It should also keep escalation paths visible so a manager can restore access, reopen a continuity case, or hand something upward without guessing who owns the next step.",
        ],
      },
      {
        id: "how-team-views-help",
        title: "How team views improve the workspace",
        body: [
          "When the team view is good, managers stop treating the product like an unreadable enterprise dashboard. They use it as a real operating lane for people and deadlines.",
          "That improves adoption and keeps the organization workspace from becoming a bottleneck owned by a tiny group of admins.",
        ],
      },
    ],
  },
  {
    slug: ["manager-views", "warehouse-operations"],
    group: "Organization Operations",
    title: "Manager Team Detail",
    eyebrow: "Team detail",
    summary:
      "A live manager-owned team lane with roster state, approval pressure, current commitments, org-market coverage, and the next people risk to resolve.",
    searchTerms: [
      "warehouse operations",
      "manager team detail",
      "team detail",
      "manager roster detail",
    ],
    sections: [
      {
        id: "team-roster",
        title: "Team roster and workload",
        body: [
          "A team detail page should make the roster, current workload, and access posture visible immediately. A manager needs to know who is active, who is waiting on approval, and who is currently protected by continuity rules.",
          "That keeps employee operations practical instead of forcing the manager to inspect each person record just to understand the team shape.",
        ],
      },
      {
        id: "team-performance",
        title: "Team commitment performance",
        body: [
          "The page should show current live commitments, recent completions, missed outcomes, and any org-market deadlines that affect the team together.",
          "That gives the manager a useful picture of accountability instead of a flat employee list with no operational meaning.",
        ],
      },
      {
        id: "manager-actions",
        title: "What the manager does from here",
        body: [
          "The manager should be able to jump into employee detail, restore access, review pending requests, and open the most relevant org-market or program from the same surface.",
          "This is where the team view stops being a report and becomes a useful operating page.",
        ],
      },
    ],
  },
  {
    slug: ["projects"],
    group: "Workspace",
    title: "Projects",
    eyebrow: "Projects",
    summary:
      "Create sandbox and production projects, separate usage by use case, and keep keys, reports, and alerts tied to the right workload.",
    searchTerms: [
      "projects",
      "create project",
      "sandbox project",
      "production project",
      "project settings",
      "usage by project",
    ],
    sections: [
      {
        id: "project-model",
        title: "Project model",
        body: [
          "Projects let a team separate integrations by environment, product line, or internal use case. A sandbox project can stay experimental while production stays clean and easy to review.",
          "That gives teams an obvious place to create the first key, run test traffic, and review real usage later.",
        ],
      },
      {
        id: "project-controls",
        title: "What projects control",
        body: [
          "Each project can own its own keys, webhook endpoints, usage view, alert thresholds, and export or report history.",
          "Projects are the unit that make dashboard and API ownership legible for real engineering organizations.",
        ],
      },
      {
        id: "first-project",
        title: "Create the first project",
        body: [
          "The recommended first step after account and organization setup is to create one sandbox project, label the purpose clearly, and connect a single test endpoint before applying for production access.",
          "Once that path works, the team can clone the same shape into production with a much lower chance of configuration drift.",
        ],
      },
    ],
  },
  {
    slug: ["projects", "sandbox-workforce-review"],
    group: "Workspace",
    title: "Project Detail",
    eyebrow: "Project detail",
    summary:
      "A focused project view for environment, webhook targets, serving keys, usage concentration, and promotion readiness.",
    searchTerms: [
      "project detail",
      "sandbox workforce review",
      "project environment",
      "webhook targets",
      "promotion readiness",
    ],
    sections: [
      {
        id: "environment-shape",
        title: "Environment shape",
        body: [
          "A project detail page should open on the actual environment boundary, current workload, and traffic shape so teams know whether they are looking at sandbox experimentation or production behavior.",
          "That keeps project ownership understandable as usage grows and more keys or reports get attached to the same lane.",
        ],
      },
      {
        id: "serving-assets",
        title: "Serving assets",
        body: [
          "Webhook targets, serving keys, threshold alerts, and report jobs all belong to the project detail surface because they are what make the project operational.",
          "When one of those assets drifts, the project page should make the problem visible without sending the operator through three different settings pages.",
        ],
      },
      {
        id: "promotion-readiness",
        title: "Promotion readiness",
        body: [
          "The project page should show whether the project is still being validated, ready for production review, or already carrying live protected usage.",
          "That gives technical and compliance owners one shared answer when they ask whether the lane is ready to move forward.",
        ],
      },
    ],
    codeSample: {
      title: "Project detail payload",
      language: "json",
      code: `{
  "project_id": "proj_sandbox_workforce_review",
  "environment": "sandbox",
  "serving_keys": 2,
  "webhook_targets": 3,
  "threshold_alerts": 1,
  "promotion_state": "ready_for_review"
}`,
      note: "Project detail should keep environment, serving assets, and promotion readiness visible in one lane.",
    },
  },
  {
    slug: ["api-keys"],
    group: "Workspace",
    title: "API Keys",
    eyebrow: "Keys",
    summary:
      "Create named keys, tie them to the right project, rotate them safely, and keep every protected HRS call tied to a clear purpose.",
    searchTerms: [
      "api keys",
      "key names",
      "create key",
      "rotate key",
      "scoped keys",
      "server side key",
    ],
    sections: [
      {
        id: "naming-and-scope",
        title: "Naming and scope",
        body: [
          "Every key should be named for the project and the workload it powers. That makes billing, audit review, and incident response much easier under real load.",
          "Keys stay tied to a project and server-side only. Browser bundles, native clients, and support surfaces never receive the raw secret.",
        ],
      },
      {
        id: "rotation",
        title: "Rotation and replacement",
        body: [
          "Key rotation is part of normal operations, not an edge case. The platform keeps old and new key windows visible long enough for safe cutovers.",
          "Usage views and webhook health help teams confirm that a rotation completed cleanly before they fully retire the old secret.",
        ],
      },
      {
        id: "first-key",
        title: "Create the first key",
        body: [
          "After the first sandbox project exists, create one clearly named key, store it server-side, run a protected lookup, and confirm the key shows usage on the dashboard.",
          "That first successful call proves the workspace, the project, and the key are all wired correctly.",
        ],
      },
    ],
    codeSample: {
      title: "Name and store the first sandbox key",
      language: "bash",
      code: `PAYTOCOMMIT_PROJECT=sandbox-workforce-review
PAYTOCOMMIT_KEY_LABEL=hrs-sandbox-backend
PAYTOCOMMIT_API_KEY=ptc_live_replace_me

curl https://api.paytocommit.com/v1/hrs/lookup \\
  -H "Authorization: Bearer $PAYTOCOMMIT_API_KEY" \\
  -H "X-PayToCommit-Project: $PAYTOCOMMIT_PROJECT" \\
  -H "Content-Type: application/json" \\
  -d '{
    "subject": { "legal_name": "Jordan Lee", "country": "US" },
    "consent_scope": "hrs.lookup.identity",
    "declared_purpose": "workforce_vetting"
  }'`,
      note: "Keep keys on the server and label them for the exact project and workload they power.",
    },
  },
  {
    slug: ["api-keys", "hrs-sandbox-backend"],
    group: "Workspace",
    title: "API Key Detail",
    eyebrow: "Key detail",
    summary:
      "A named key detail page for last use, scope, rotation window, serving project, and the workload it is allowed to power.",
    searchTerms: [
      "key detail",
      "hrs sandbox backend",
      "rotation window",
      "last use",
      "key scope detail",
    ],
    sections: [
      {
        id: "identity-and-scope",
        title: "Identity and scope",
        body: [
          "A key detail page should make the serving project, workload label, and scope model obvious before the operator thinks about rotating or replacing the secret.",
          "That prevents key sprawl from turning into a billing or incident response problem later.",
        ],
      },
      {
        id: "rotation-health",
        title: "Rotation health",
        body: [
          "Rotation timing, last successful use, and stale-or-overlapping windows belong on the key detail page itself because that is where the operator decides whether the key is still safe to keep around.",
          "The platform should make those windows visible without requiring the team to inspect raw audit logs first.",
        ],
      },
      {
        id: "project-and-playground",
        title: "Project and playground links",
        body: [
          "A named key should stay linked to the project it serves and the playground lane that proves it still works. That way issuance, testing, and rotation stay part of one flow instead of separate chores.",
          "It also makes it much easier to explain why a key exists during an audit review.",
        ],
      },
    ],
    codeSample: {
      title: "Key detail payload",
      language: "json",
      code: `{
  "key_label": "hrs-sandbox-backend",
  "project_id": "proj_sandbox_workforce_review",
  "scope": "hrs.lookup.identity",
  "last_used_at": "2026-03-12T14:18:00Z",
  "rotation_due_in_days": 22,
  "stale": false
}`,
      note: "A key detail page should connect identity, scope, last use, and rotation timing in one operational record.",
    },
  },
  {
    slug: ["playground"],
    group: "Workspace",
    title: "Playground and Test Calls",
    eyebrow: "Playground",
    summary:
      "Run the first consent-scoped test call, inspect the response, and confirm the lookup lands in the audit log before production review.",
    searchTerms: [
      "playground",
      "test call",
      "api explorer",
      "first request",
      "sandbox test",
      "response preview",
    ],
    sections: [
      {
        id: "what-the-playground-does",
        title: "What the playground does",
        body: [
          "The playground is the fastest way to verify that the project, key, consent scope, and declared purpose are wired correctly.",
          "It shows the request shape, the returned HRS payload, the consent metadata, and the audit trace recorded for that test call.",
        ],
      },
      {
        id: "response-review",
        title: "What teams review",
        body: [
          "Teams usually review the current HRS, trend direction, consent timestamp, and the permitted event history fields before they wire the same response into their product.",
          "The goal is not just to see a successful response. It is to understand the exact scope and contract the integration will rely on.",
        ],
      },
      {
        id: "move-forward",
        title: "What happens after the first test",
        body: [
          "Once the first request lands, teams usually attach webhooks, verify retries and signatures, and then use the platform dashboard to monitor usage and alerting.",
          "From there the project can move through production review with much better operational confidence.",
        ],
      },
    ],
  },
  {
    slug: [],
    group: "Start Here",
    title: "Developer Platform Overview",
    eyebrow: "Platform",
    summary:
      "Build against the Human Reliability API, monitor usage, review consent scope, and move from sandbox to production from one platform workspace.",
    searchTerms: [
      "developer platform",
      "overview",
      "hrs api",
      "dashboard",
      "usage billing",
      "sandbox",
      "production",
    ],
    sections: [
      {
        id: "overview",
        title: "What the platform covers",
        body: [
          "The developer platform combines HRS API access, enterprise dashboards, billing visibility, webhooks, exports, and integration docs in one place.",
          "Public reference pages stay readable without signing in. Protected enterprise access still requires the right consent scope, audit trail, and approved key state.",
        ],
      },
      {
        id: "what-you-get",
        title: "What teams use it for",
        body: [
          "Use the HRS API to retrieve consent-scoped Human Reliability signals, trend history, and permitted event history for approved customer workflows.",
          "Use the dashboard to review portfolio health, webhook delivery, billing usage, exports, and customer-level reliability history.",
        ],
      },
      {
        id: "fast-start",
        title: "Fast path",
        body: [
          "Start with account access, create an organization, create the first sandbox project, name the first key, and run one protected lookup in the playground.",
          "Move to the HRS API and Platform Dashboard guides when your organization is ready for production traffic, reporting, webhook health, and audit review.",
        ],
      },
    ],
    codeSample: {
      title: "First protected lookup",
      language: "bash",
      code: `curl https://api.paytocommit.com/v1/hrs/lookup \\
  -H "Authorization: Bearer $PAYTOCOMMIT_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "subject": {
      "legal_name": "Jordan Lee",
      "country": "US"
    },
    "consent_scope": "hrs.lookup.identity",
    "declared_purpose": "workforce_vetting"
  }'`,
      note: "Protected HRS lookups stay consent-scoped, auditable, and purpose-bound.",
    },
  },
  {
    slug: ["quickstarts"],
    group: "Start Here",
    title: "Quickstarts",
    eyebrow: "Quickstarts",
    summary:
      "Go from empty account to the first successful HRS lookup, webhook signature check, and dashboard review with minimal setup friction.",
    searchTerms: [
      "quickstart",
      "sandbox",
      "first call",
      "developer onboarding",
      "setup",
      "webhook quickstart",
    ],
    sections: [
      {
        id: "sandbox-setup",
        title: "Sandbox setup",
        body: [
          "Create a developer account or sign in, attach it to an organization workspace, create the first sandbox project, declare the use case, and wait for sandbox approval.",
          "Once approved, the platform issues a project key, exposes test subjects, and enables reports, key usage, and playground calls inside the dashboard.",
        ],
      },
      {
        id: "first-requests",
        title: "First requests",
        body: [
          "Make one HRS lookup in the playground or from your server, review the returned consent metadata, and verify that your audit trail captured the request correctly.",
          "Then subscribe a webhook endpoint and confirm that signed events arrive with the same project, organization, and consent context you declared.",
        ],
      },
      {
        id: "move-to-production",
        title: "Production review",
        body: [
          "Production access adds billing usage, expanded report controls, export jobs, and organization-level health summaries.",
          "The production checklist focuses on consent scope, audit retention, webhook verification, retry handling, and internal access controls.",
        ],
      },
    ],
  },
  {
    slug: ["quickstarts", "first-protected-lookup"],
    group: "Start Here",
    title: "First Protected Lookup",
    eyebrow: "Quickstart detail",
    summary:
      "The end-to-end quickstart for organization setup, sandbox key issuance, first lookup, webhook check, and dashboard confirmation.",
    searchTerms: [
      "first protected lookup",
      "quickstart detail",
      "first hrs lookup",
      "first webhook check",
      "developer first request",
    ],
    sections: [
      {
        id: "lookup-sequence",
        title: "Lookup sequence",
        body: [
          "A good quickstart should show the exact sequence: create the workspace, create the project, issue the key, call the endpoint, inspect the response, and verify the audit entry.",
          "The point is not only to get a 200 response. It is to prove that the consent scope, declared purpose, and audit trail are already behaving correctly.",
        ],
      },
      {
        id: "webhook-check",
        title: "Webhook check",
        body: [
          "Right after the first lookup, the quickstart should move into webhook signature verification and retry testing so the integration path is proven before any production review starts.",
          "That keeps the first hour grounded in real operations instead of only code samples.",
        ],
      },
      {
        id: "handoff",
        title: "Handoff to production review",
        body: [
          "Once the first lookup and the first webhook are clean, the page should point directly into production review with the exact project and key context preserved.",
          "This is what makes the onboarding path feel like a real platform workflow instead of a collection of disconnected docs.",
        ],
      },
    ],
    codeSample: {
      title: "First protected lookup sequence",
      language: "json",
      code: `{
  "workspace": "ws_northstar_platform",
  "project": "proj_sandbox_workforce_review",
  "key_label": "hrs-sandbox-backend",
  "lookup_state": "verified",
  "webhook_check": "passed",
  "next_step": "production_review"
}`,
      note: "A quickstart detail page should connect the first lookup, webhook verification, and production handoff in one traceable workflow.",
    },
  },
  {
    slug: ["sandbox-access"],
    group: "Start Here",
    title: "Sandbox Access",
    eyebrow: "Sandbox",
    summary:
      "Request sandbox access, get test subjects, run the first lookup, and prove the integration path before production review starts.",
    searchTerms: [
      "sandbox access",
      "sandbox approval",
      "test subjects",
      "developer sandbox",
      "first lookup",
      "sandbox webhook",
    ],
    sections: [
      {
        id: "request-access",
        title: "Request access",
        body: [
          "Sandbox access starts after the workspace, organization, and first project exist. The request captures the use case, the expected lookup pattern, and the billing owner.",
          "Once approved, the workspace receives a sandbox key, example subjects, and the first set of reporting and webhook tools.",
        ],
      },
      {
        id: "test-with-real-shape",
        title: "Test with the real request shape",
        body: [
          "Sandbox calls use the same request structure as production. Teams can validate consent fields, webhook signatures, retries, and audit history before real customer traffic ever arrives.",
          "That keeps the cutover to production clean because the integration shape is already proven.",
        ],
      },
      {
        id: "what-to-finish",
        title: "What to finish before production",
        body: [
          "Before production review, finish one successful lookup, verify at least one webhook delivery, confirm billing visibility, and make sure the team can trace key usage and audit history.",
          "If any of those steps are missing, fix them in sandbox first instead of carrying that uncertainty into live traffic.",
        ],
      },
    ],
  },
  {
    slug: ["sandbox-access", "workforce-vetting"],
    group: "Start Here",
    title: "Sandbox Approval Detail",
    eyebrow: "Sandbox detail",
    summary:
      "A detailed sandbox request for one concrete use case, with declared purpose, expected traffic band, and operator checklist.",
    searchTerms: [
      "sandbox approval detail",
      "workforce vetting sandbox",
      "sandbox request detail",
      "declared purpose",
      "traffic band",
    ],
    sections: [
      {
        id: "declared-use-case",
        title: "Declared use case",
        body: [
          "Sandbox approval should show the actual use case, why the organization wants protected HRS access, and what the expected lookup band looks like before approval is granted.",
          "That gives reviewers enough context to decide whether the request belongs in sandbox, needs scope changes, or is not ready yet.",
        ],
      },
      {
        id: "review-owners",
        title: "Review owners and checks",
        body: [
          "The detail page should make the requesting technical owner, billing owner, and reviewing owner visible, along with the exact checklist items still blocking approval.",
          "That keeps sandbox approval from becoming a black-box queue.",
        ],
      },
      {
        id: "after-approval",
        title: "After approval",
        body: [
          "Once approved, the workspace should be able to move directly into project setup, key issuance, and the first protected lookup without re-entering the same use-case details.",
          "That is what makes sandbox approval feel like part of one smooth operator path.",
        ],
      },
    ],
    codeSample: {
      title: "Sandbox approval detail",
      language: "json",
      code: `{
  "request_id": "sbx_req_workforce_vetting",
  "declared_purpose": "workforce_vetting",
  "expected_lookup_band": "2k_to_5k_monthly",
  "request_state": "under_review",
  "blocking_checks": ["billing_owner_confirmed", "webhook_target_declared"]
}`,
      note: "Sandbox detail should keep the request context and blocking checks visible all the way through approval.",
    },
  },
  {
    slug: ["production-review"],
    group: "Start Here",
    title: "Production Review",
    eyebrow: "Production",
    summary:
      "Move from sandbox into production through consent review, billing setup, webhook verification, and customer-data safeguards.",
    searchTerms: [
      "production review",
      "go live",
      "production access",
      "billing setup",
      "webhook verification",
      "consent review",
    ],
    sections: [
      {
        id: "review-checklist",
        title: "What gets reviewed",
        body: [
          "Production review checks the declared use case, consent handling, webhook verification, billing ownership, audit readiness, and internal access controls.",
          "The goal is simple: confirm that the organization can operate the API safely and explain how it uses the returned data.",
        ],
      },
      {
        id: "go-live-path",
        title: "Go-live path",
        body: [
          "Once the review clears, the workspace receives production keys, production billing, and the full dashboard and export controls tied to that environment.",
          "Teams should keep sandbox running in parallel for test traffic and schema validation while live traffic moves through production only.",
        ],
      },
      {
        id: "after-approval",
        title: "After approval",
        body: [
          "After approval, set alert thresholds, confirm webhook health, review the first live audit entries, and give finance owners access to usage and invoicing.",
          "That first live operating pass matters more than the paperwork because it proves the organization can actually run the integration cleanly.",
        ],
      },
    ],
  },
  {
    slug: ["production-review", "northstar-live-review"],
    group: "Start Here",
    title: "Production Review Detail",
    eyebrow: "Production detail",
    summary:
      "A live production-readiness review showing consent handling, billing ownership, webhook health, and the final issues still blocking go-live.",
    searchTerms: [
      "production review detail",
      "live review",
      "go live detail",
      "webhook health review",
      "billing owner review",
    ],
    sections: [
      {
        id: "readiness-state",
        title: "Readiness state",
        body: [
          "A production review detail page should show the exact go-live state for one organization or project, including which checks are complete and which still block the release.",
          "That gives engineering, compliance, and billing the same answer when they ask whether live traffic is actually ready to begin.",
        ],
      },
      {
        id: "critical-checks",
        title: "Critical checks",
        body: [
          "Consent handling, webhook signatures, billing ownership, key hygiene, audit exports, and customer-data safeguards should all remain visible in one production review lane.",
          "The point is to make the final approval explainable instead of forcing reviewers to reconstruct the state from scattered tools.",
        ],
      },
      {
        id: "release-handoff",
        title: "Release handoff",
        body: [
          "Once the final blocking checks are resolved, the production review page should hand the team directly into the live workspace and the first production usage view.",
          "That keeps the review lane connected to the real operating dashboard that takes over after launch.",
        ],
      },
    ],
    codeSample: {
      title: "Production review detail",
      language: "json",
      code: `{
  "review_id": "prd_rev_northstar_live_review",
  "state": "waiting_on_final_webhook_check",
  "consent_review": "passed",
  "billing_owner": "confirmed",
  "key_hygiene": "healthy",
  "next_step": "verify_last_signed_delivery"
}`,
      note: "Production review detail should keep blocking checks and the next release action visible until the lane is fully cleared.",
    },
  },
  {
    slug: ["hrs-api"],
    group: "Core APIs",
    title: "Human Reliability API",
    eyebrow: "HRS API",
    summary:
      "The canonical reference for consent-scoped identity-backed reliability access, trend retrieval, historical events, and enterprise safeguards.",
    searchTerms: [
      "hrs api",
      "human reliability api",
      "identity backed",
      "consent scope",
      "trend graph",
      "customer reliability",
    ],
    sections: [
      {
        id: "consent-scope",
        title: "Consent and identity scope",
        body: [
          "Protected HRS responses require an active consent record that covers the exact lookup scope being requested.",
          "Identity-backed matching stays audit logged and may be filtered down further depending on what the account holder allowed an enterprise to view.",
        ],
      },
      {
        id: "response-shape",
        title: "Response shape",
        body: [
          "The API can return current HRS, trend direction, permitted event history, and consent metadata. More detailed monetary or market history requires stricter explicit scope.",
          "Every response remains organization-scoped, rate-limited, and traceable back to the key and declared purpose that produced it.",
        ],
      },
      {
        id: "use-cases",
        title: "Operational use",
        body: [
          "Teams use the API for workforce qualification, internal trust checks, application screening, customer trust workflows, and longitudinal reliability review.",
          "Usage billing is tied to protected lookup volume, exports, and higher-cost report jobs rather than seat counts.",
        ],
      },
    ],
  },
  {
    slug: ["reference"],
    group: "Reference",
    title: "API Reference",
    eyebrow: "Reference",
    summary:
      "Reference paths for HRS lookups, exports, webhooks, reports, consent retrieval, billing metrics, and key-scoped management endpoints.",
    searchTerms: [
      "reference",
      "endpoints",
      "api reference",
      "exports",
      "billing",
      "webhooks",
      "consent retrieval",
    ],
    sections: [
      {
        id: "endpoint-families",
        title: "Endpoint families",
        body: [
          "The reference is grouped into HRS lookups, consent state, customer detail retrieval, exports, reports, webhooks, billing usage, and organization health.",
          "Each family documents auth requirements, scope expectations, idempotency behavior, retry semantics, and audit side effects.",
        ],
      },
      {
        id: "versioning",
        title: "Versioning and stability",
        body: [
          "Every endpoint is versioned, and high-signal changes route through the changelog before they become the new default expectation.",
          "Sample code and request examples stay aligned to the currently supported version family to reduce integration drift.",
        ],
      },
    ],
  },
  {
    slug: ["webhooks"],
    group: "Reference",
    title: "Webhooks",
    eyebrow: "Webhooks",
    summary:
      "Event delivery, signing, retries, health monitoring, replay protection, and dashboard verification for PayToCommit enterprise integrations.",
    searchTerms: [
      "webhooks",
      "signatures",
      "retries",
      "event delivery",
      "health",
      "replay protection",
    ],
    sections: [
      {
        id: "delivery",
        title: "Delivery model",
        body: [
          "Webhook delivery is signed, retry-aware, and organization-scoped. The dashboard shows event health, retry pressure, and the last verified delivery for every endpoint.",
          "Delivery examples cover HRS updates, consent changes, export completion, billing threshold alerts, and report-ready events.",
        ],
      },
      {
        id: "verify-signatures",
        title: "Signature verification",
        body: [
          "Each request carries a verifiable signature and timestamp that should be checked before your system trusts the payload.",
          "Replay protection and retry idempotency are documented alongside the verification recipe so teams can deploy safely from the start.",
        ],
      },
    ],
    codeSample: {
      title: "Verify a webhook signature",
      language: "ts",
      code: `import crypto from "node:crypto";

export function verifyPayToCommitSignature(rawBody: string, signature: string, secret: string) {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}`,
      note: "Use the raw request body and reject stale timestamps before processing the event.",
    },
  },
  {
    slug: ["pricing"],
    group: "Operations",
    title: "Usage Billing",
    eyebrow: "Billing",
    summary:
      "How HRS API usage, report generation, exports, webhook volume, and dashboard-heavy workflows are measured and billed.",
    searchTerms: [
      "pricing",
      "billing",
      "usage based",
      "metering",
      "reports",
      "exports",
    ],
    sections: [
      {
        id: "metering",
        title: "What is metered",
        body: [
          "Usage billing tracks protected HRS lookups, expanded-history retrievals, export jobs, scheduled reports, webhook delivery volume, and premium dashboard workflows where enabled.",
          "The platform avoids seat-based pricing for the HRS API itself. The billable primitive is protected usage, not access to a different model tier.",
        ],
      },
      {
        id: "billing-views",
        title: "Billing views",
        body: [
          "The dashboard includes current usage, projected spend, threshold alerts, per-key consumption, and export-ready billing reports.",
          "Finance and technical owners can see which workflows are driving usage without losing the audit context that explains why those calls were made.",
        ],
      },
    ],
  },
  {
    slug: ["platform-dashboard"],
    group: "Operations",
    title: "Platform Dashboard",
    eyebrow: "Dashboard",
    summary:
      "The enterprise master dashboard for queried customers, HRS distribution, billing usage, webhook health, exports, and customer-level drill-downs.",
    searchTerms: [
      "dashboard",
      "master dashboard",
      "customer detail",
      "webhook health",
      "usage",
      "exports",
    ],
    sections: [
      {
        id: "overview-panels",
        title: "Overview panels",
        body: [
          "The master dashboard shows organizations, projects, current keys, total queried customers, recent HRS distribution, recent API usage, consent-state summaries, webhook health, and export/report shortcuts.",
          "It is designed as a real working dashboard, not a marketing summary, so teams can monitor trust workflows, manage projects, and investigate customer-level history quickly.",
        ],
      },
      {
        id: "customer-detail",
        title: "Customer detail view",
        body: [
          "Customer detail pages expose the permitted HRS trend graph, recoveries, declines, plateaus, consent timestamp, and relevant reliability events for that subject.",
          "Drill-down surfaces support date filters, export actions, and audit-friendly timeline review while respecting the subject's active consent scope.",
        ],
      },
      {
        id: "workspace-operations",
        title: "Workspace operations",
        body: [
          "The dashboard is also the control surface for project health, export backlog, billing drift, approval queues, and webhook delivery. Operators should be able to move from one alert into the exact lane that can resolve it.",
          "That is why the platform host opens here by default: the dashboard is where organizations understand what is healthy, what is drifting, and what needs action next.",
        ],
      },
    ],
    codeSample: {
      title: "Platform dashboard summary payload",
      language: "json",
      code: `{
  "organization_id": "org_northstar_logistics",
  "workspace_health": {
    "projects": 3,
    "healthy_keys": 4,
    "pending_exports": 2,
    "employee_approvals_waiting": 18
  },
  "portfolio": {
    "queried_customers": 142,
    "recoveries_flagged": 4,
    "consent_expiring_soon": 3
  }
}`,
      note: "The platform dashboard should summarize the operational state first, then route the operator into the exact lane that needs attention.",
    },
  },
  {
    slug: ["customers"],
    group: "Operations",
    title: "Customer Portfolio",
    eyebrow: "Customers",
    summary:
      "Consent-scoped customer records, trend review, and single-customer drill-down for enterprise teams who need a serious working portfolio.",
    searchTerms: [
      "customers",
      "portfolio",
      "customer drill down",
      "customer detail",
      "hrs trend",
      "reliability history",
    ],
    sections: [
      {
        id: "portfolio-view",
        title: "Portfolio view",
        body: [
          "The portfolio view keeps every consent-backed customer record in one working list so teams can sort by current HRS, recent movement, cohort, or alert state.",
          "This is where teams move from raw lookup volume into a clear picture of the customers they are monitoring.",
        ],
      },
      {
        id: "drill-down",
        title: "Customer drill-down",
        body: [
          "Each customer record opens a detailed timeline with rises, declines, recoveries, plateaus, consent history, and the event markers allowed under the active scope.",
          "The drill-down gives risk, trust, and qualification teams a serious view instead of a summary card with no usable depth.",
        ],
      },
      {
        id: "scope-guard",
        title: "Scope guard",
        body: [
          "The portfolio never exposes fields outside the active consent and purpose boundary. Identity-backed matching, event depth, and report actions stay tied to the approved purpose and audit logged.",
          "That preserves operational usefulness without quietly turning the dashboard into an unrestricted people-search tool.",
        ],
      },
      {
        id: "timeline-review",
        title: "Timeline review",
        body: [
          "A serious customer page needs more than a score. Teams should be able to inspect rises, plateaus, recoveries, and negative events in time order, then explain why the current trend looks the way it does.",
          "Date filters, export shortcuts, and cohort labels keep that review usable inside a real trust workflow instead of trapping it in one static chart.",
        ],
      },
    ],
    codeSample: {
      title: "Consent-scoped customer detail response",
      language: "json",
      code: `{
  "subject_id": "subj_28401",
  "hrs": {
    "current": 782,
    "trend": "recovering",
    "plateau_window_days": 19
  },
  "consent": {
    "scope": "hrs.lookup.identity",
    "granted_at": "2026-02-01T13:24:00Z"
  },
  "recent_events": [
    { "type": "verified_completion", "at": "2026-03-01T09:10:00Z" },
    { "type": "early_release", "at": "2026-02-18T12:42:00Z" }
  ]
}`,
      note: "Customer drill-down stays bounded by consent scope while still giving operators a serious trend view and event history.",
    },
  },
  {
    slug: ["customers", "sovereign-node-1184"],
    group: "Operations",
    title: "Customer Reliability Detail",
    eyebrow: "Customer detail",
    summary:
      "A full single-subject drill-down with HRS trajectory, consent history, event explanations, export shortcuts, and audit-safe operational context.",
    searchTerms: [
      "customer detail",
      "reliability detail",
      "hrs trajectory",
      "recoveries",
      "plateaus",
      "subject timeline",
      "consent history",
    ],
    sections: [
      {
        id: "trajectory",
        title: "Trajectory and current state",
        body: [
          "The detail view should open with the current HRS, the active trend, the last material change, and a graph that makes rises, declines, plateaus, and recoveries obvious without flattening the subject into one number.",
          "Operators need to see whether the current score is stabilizing, sliding, or recovering, then move straight into the events that explain why.",
        ],
      },
      {
        id: "event-timeline",
        title: "Event timeline",
        body: [
          "The timeline keeps verified completions, early releases, missed commitments, consent changes, and scope-limited reliability events in time order with date filters and operator notes.",
          "That is what makes the page useful during underwriting, qualification, or trust review instead of turning it into a decorative analytics chart.",
        ],
      },
      {
        id: "consent-and-scope",
        title: "Consent and scope",
        body: [
          "The subject page keeps the consent timestamp, active scope, identity-matching status, and any upcoming scope expiry visible at all times.",
          "Every export, share, and operator action remains tied to the same approved scope so the page never turns into an unrestricted people-search surface.",
        ],
      },
      {
        id: "operator-actions",
        title: "Operator actions",
        body: [
          "The detail view should make the next action obvious: open a scoped export, compare the subject to a saved cohort, review audit history, or return to the wider portfolio.",
          "That keeps the platform workspace operational instead of forcing teams to rebuild trust decisions from disconnected screens.",
        ],
      },
      {
        id: "cohort-context",
        title: "Cohort context",
        body: [
          "A single-customer page should still show the subject's current cohort, why the subject is in that lane, and how the current trajectory compares with the surrounding portfolio. That gives teams enough context to explain whether the record is exceptional or representative.",
          "Without that surrounding context, even a detailed graph turns into an isolated story that is harder to operationalize.",
        ],
      },
    ],
    codeSample: {
      title: "Customer reliability detail payload",
      language: "json",
      code: `{
  "subject_id": "subj_1184",
  "display_label": "Sovereign Node #1184",
  "hrs": {
    "current": 812,
    "trend": "recovering",
    "last_material_change_at": "2026-03-05T14:20:00Z"
  },
  "trajectory": {
    "rise_windows": 4,
    "plateau_windows": 2,
    "recovery_windows": 1,
    "decline_windows": 1
  },
  "consent": {
    "scope": "hrs.lookup.identity.extended",
    "granted_at": "2026-01-14T11:08:00Z",
    "expiring_at": "2026-04-01T00:00:00Z"
  },
  "recent_events": [
    { "type": "verified_completion", "at": "2026-03-05T14:20:00Z", "impact": "+14" },
    { "type": "early_release", "at": "2026-02-22T09:11:00Z", "impact": "-8" }
  ]
}`,
      note: "A serious customer page needs trajectory, scope, and event context together so operators can explain the score instead of merely reading it.",
    },
  },
  {
    slug: ["workforce-rollout"],
    group: "Operations",
    title: "Workforce Rollout",
    eyebrow: "Workforce",
    summary:
      "Invite employees by company email, run company-specific onboarding, and keep enterprise commitment activity visible with policy-safe access controls.",
    searchTerms: [
      "workforce rollout",
      "employee onboarding",
      "company email",
      "employee invite",
      "enterprise employees",
      "organization onboarding",
    ],
    sections: [
      {
        id: "invite-model",
        title: "Invite model",
        body: [
          "Organizations can invite employees by company email directly from the workspace. The invite email opens a company-specific onboarding flow that keeps the normal PayToCommit account model intact while attaching the employee to the right organization.",
          "Employees can still browse and use PayToCommit like a normal account holder, but the organization workspace can also see the commitments, completions, and company-specific markets that fall under the permitted enterprise view.",
        ],
      },
      {
        id: "employee-invite-operations",
        title: "Employee invite operations",
        body: [
          "Workforce rollout is designed for real operators, not one-off hand entry. Teams can paste or upload company-email rosters, search the pending queue, approve a single employee, or approve a clean batch once the right owner signs off.",
          "The workspace keeps each request tied to the company domain, requested role, onboarding status, and any policy flags so a manager can understand the queue quickly even when hundreds or thousands of employees are moving through it.",
        ],
      },
      {
        id: "company-onboarding",
        title: "Company-specific onboarding",
        body: [
          "Company-email onboarding can show a different first-run path than a public consumer signup. The employee still creates a normal account first, then moves into the organization-specific onboarding and permissions flow once the company email is recognized.",
          "That keeps signup light while still giving the employer a structured way to onboard a large team into enterprise markets, organization-specific channels, and the right role permissions.",
        ],
      },
      {
        id: "employee-vs-enterprise-view",
        title: "Employee account and enterprise view",
        body: [
          "Employees keep one PayToCommit account. The difference is that company-email enrollment unlocks the organization dashboard, role-bound permissions, and enterprise-specific markets alongside the normal consumer experience.",
          "That means the employee can still use broader Commitment Markets while the employer can review company-market participation, completion history, and the permitted activity tied to that organization relationship.",
        ],
      },
      {
        id: "enterprise-markets",
        title: "Organization markets and visibility",
        body: [
          "Enterprise categories can expose organization-specific markets alongside the rest of Commitment Markets. Employees can still join broader public markets, but the enterprise workspace can also track the company-specific commitments it created for its own people.",
          "That lets managers review what is joined, what is completed, what is missed, and what still needs action without collapsing the employee experience into a pure admin tool.",
        ],
      },
      {
        id: "manager-controls",
        title: "Manager controls",
        body: [
          "Managers and admins can search employees by company email, review joined markets, filter for missed work, and keep organization channels aligned with the commitments they own. Role templates keep those controls visible to the right people without giving every manager the same authority.",
          "The result is a workforce lane that feels like a serious operating console: approvals, company markets, employee status, and follow-through reporting all stay in one place.",
        ],
      },
    ],
    codeSample: {
      title: "Send company-email invites into workforce onboarding",
      language: "json",
      code: `{
  "organization_id": "org_northstar_logistics",
  "invite_batch": [
    {
      "email": "alex.nguyen@northstar.example",
      "role_template": "operations_manager",
      "market_group": "warehouse-safety"
    },
    {
      "email": "maya.lee@northstar.example",
      "role_template": "team_member",
      "market_group": "delivery-accuracy"
    }
  ],
  "delivery_mode": "email",
  "company_onboarding_template": "northstar-launch-q2"
}`,
      note: "Company-email invites attach employees to the organization after normal account creation instead of replacing the core PayToCommit account model.",
    },
  },
  {
    slug: ["employee-invites"],
    group: "Operations",
    title: "Employee Invites",
    eyebrow: "Invites",
    summary:
      "Send single, bulk, and CSV-backed company-email invites with role templates, market groups, and branded onboarding messages.",
    searchTerms: [
      "employee invites",
      "company email invite",
      "bulk invite",
      "csv invite upload",
      "invite employees",
      "organization invite flow",
    ],
    sections: [
      {
        id: "invite-entry",
        title: "Invite entry",
        body: [
          "Organizations should be able to invite one employee, paste a batch of company emails, or upload a clean CSV without leaving the platform workspace.",
          "The invite entry surface needs to stay compact and readable even when a manager is preparing a large rollout across several teams or departments.",
        ],
      },
      {
        id: "role-and-policy",
        title: "Role, team, and policy binding",
        body: [
          "Each invite can carry a role template, team or department assignment, onboarding template, and any org-market group the employee should see first.",
          "This keeps company onboarding controlled without forcing the admin to reconfigure the same permissions after every invite lands.",
        ],
      },
      {
        id: "email-delivery",
        title: "Branded invite delivery",
        body: [
          "Invite emails should explain the organization context, what access the employee is being offered, and what happens next after account creation. The employee needs one obvious path into the correct workspace.",
          "Good invite email delivery feels trustworthy and enterprise-grade. It should not read like a generic marketing blast or a vague admin notice.",
        ],
      },
    ],
    codeSample: {
      title: "Employee invite batch",
      language: "json",
      code: `{
  "organization_id": "org_northstar_logistics",
  "delivery_mode": "email",
  "invites": [
    {
      "email": "olivia.gray@northstar.example",
      "role_template": "team_member",
      "team": "Warehouse Operations",
      "market_group": "safety-and-handoffs"
    },
    {
      "email": "emmanuel.ross@northstar.example",
      "role_template": "manager",
      "team": "Night Shift",
      "market_group": "dock-readiness"
    }
  ]
}`,
      note: "Invite entry should be fast for one employee and reliable for large onboarding waves.",
    },
  },
  {
    slug: ["employee-invites", "northstar-wave-3"],
    group: "Operations",
    title: "Employee Invite Batch Detail",
    eyebrow: "Invite detail",
    summary:
      "A focused rollout detail for one invite batch with delivery state, bounce handling, role mapping, and next-step onboarding coverage.",
    searchTerms: [
      "invite batch detail",
      "employee invite detail",
      "northstar wave 3",
      "delivery state",
      "invite email batch",
    ],
    sections: [
      {
        id: "batch-health",
        title: "Batch health",
        body: [
          "An invite-batch detail surface should show how many emails were sent, delivered, opened, accepted, or bounced so operators can correct gaps before the approval queue fills up with noise.",
          "This is where a rollout owner should see if one department is stuck, one domain alias is failing, or a CSV import carried the wrong role template.",
        ],
      },
      {
        id: "follow-up-actions",
        title: "Follow-up actions",
        body: [
          "A real operator surface should make resend, correction, and reassignment obvious without requiring the owner to rebuild the whole batch from scratch.",
          "If the invites are healthy, the next action should move straight into approvals or onboarding rather than leaving the owner on a dead-end status page.",
        ],
      },
    ],
    codeSample: {
      title: "Invite batch detail payload",
      language: "json",
      code: `{
  "invite_batch_id": "northstar_wave_3",
  "sent": 240,
  "delivered": 235,
  "opened": 198,
  "accepted": 162,
  "bounced": 5,
  "default_role_template": "team_member"
}`,
      note: "Batch detail should connect delivery, acceptance, and correction work in one lane.",
    },
  },
  {
    slug: ["company-email-access"],
    group: "Operations",
    title: "Company Email Access States",
    eyebrow: "Company access",
    summary:
      "How invited, auto-approved, pending-approval, continuity, and blocked company-email states behave across the organization workspace.",
    searchTerms: [
      "company email access",
      "pending employer approval",
      "blocked employee",
      "organization access state",
      "company email signup",
      "continuity access",
    ],
    sections: [
      {
        id: "state-model",
        title: "State model",
        body: [
          "A company email can be invited, auto-approved, pending manual approval, temporarily restricted, in continuity access mode, or blocked by explicit organization policy.",
          "Those states need to stay visible to both the employee and the organization so nobody is left guessing why access changed.",
        ],
      },
      {
        id: "pending-and-blocked",
        title: "Pending and blocked",
        body: [
          "Pending approval should feel like a calm waiting state with real-time updates, access-request actions, and a clear explanation that the organization still needs to act.",
          "Blocked state should stay respectful and low-drama. It should protect organization policy without leaking unnecessary internal admin detail.",
        ],
      },
      {
        id: "continuity-mode",
        title: "Continuity access mode",
        body: [
          "If an employee already joined active commitments, reduced organization access must still preserve the minimum path needed to see deadlines, receive reminders, and submit proof on time.",
          "That continuity-access rule protects both the employee and the organization from avoidable proof misses and unnecessary trust damage.",
        ],
      },
    ],
    codeSample: {
      title: "Company-email access state",
      language: "json",
      code: `{
  "email": "jordan.lee@northstar.example",
  "organization_state": "pending_approval",
  "continuity_access": false,
  "requested_role": "manager",
  "request_source": "company_email_signup"
}`,
      note: "Company-email detection should route cleanly into a specific, explainable access state.",
    },
  },
  {
    slug: ["company-email-access", "pending-employer-approval"],
    group: "Operations",
    title: "Pending Employer Approval",
    eyebrow: "Pending state",
    summary:
      "The employee-side pending state shown when a recognized company email still needs manager or admin approval before organization access is activated.",
    searchTerms: [
      "pending employer approval",
      "pending company email",
      "waiting for employer approval",
      "employee pending state",
      "organization approval wait",
    ],
    sections: [
      {
        id: "employee-view",
        title: "Employee-side pending view",
        body: [
          "The pending-approval surface should explain that the employee account exists, the company domain was recognized, and the organization still needs to approve access before the managed workspace opens.",
          "It should also give the employee a clear way to request access again, check status, and understand what will happen once the organization approves the request.",
        ],
      },
      {
        id: "manager-signal",
        title: "Manager signal",
        body: [
          "Pending employer approval should also create a clean signal inside the organization queue so managers see the request, the requested role, and the originating company-email route immediately.",
          "That keeps employee and manager state aligned instead of creating a silent approval gap.",
        ],
      },
    ],
    codeSample: {
      title: "Pending approval state",
      language: "json",
      code: `{
  "access_state": "pending_approval",
  "organization_name": "Northstar Logistics",
  "requested_role": "operations_manager",
  "request_action": "request_access_again",
  "realtime_updates": true
}`,
      note: "The pending state should be calm, informative, and connected to the queue in real time.",
    },
  },
  {
    slug: ["company-email-access", "blocked-company-email"],
    group: "Operations",
    title: "Blocked Company Email State",
    eyebrow: "Blocked state",
    summary:
      "The respectful blocked state shown when a company email is explicitly denied by organization policy, role policy, or a domain-level rule.",
    searchTerms: [
      "blocked company email",
      "employee blocked",
      "company email denied",
      "organization blocked state",
      "denied join request",
    ],
    sections: [
      {
        id: "blocked-view",
        title: "Blocked employee view",
        body: [
          "A blocked company-email state should explain that the organization has not granted access under the current policy without exposing private admin notes or internal reasoning that the employee should not see.",
          "The state should still point the employee toward a safe next step such as contacting the employer or opening a permitted support path if the block seems incorrect.",
        ],
      },
      {
        id: "policy-trace",
        title: "Policy trace for admins",
        body: [
          "The organization workspace should retain the internal policy reason, who blocked access, and whether the email can be restored or moved into a narrower role template later.",
          "That keeps blocked state auditable without making the public-facing employee experience harsh or chaotic.",
        ],
      },
    ],
    codeSample: {
      title: "Blocked company-email response",
      language: "json",
      code: `{
  "access_state": "blocked",
  "organization_name": "Northstar Logistics",
  "employee_view_reason": "Access has not been granted by your organization.",
  "admin_policy_reference": "blocked_alias_policy_night_shift"
}`,
      note: "Blocked state should remain respectful externally and auditable internally.",
    },
  },
  {
    slug: ["organization-onboarding"],
    group: "Operations",
    title: "Organization Onboarding",
    eyebrow: "Onboarding",
    summary:
      "The managed onboarding flow for approved employees, including role disclosure, visibility policy, organization markets, and workspace routing.",
    searchTerms: [
      "organization onboarding",
      "enterprise onboarding",
      "managed account onboarding",
      "employee onboarding flow",
      "organization workspace onboarding",
    ],
    sections: [
      {
        id: "role-disclosure",
        title: "Role and visibility disclosure",
        body: [
          "Organization onboarding should show the employee’s role, the organization’s visibility policy, and what the company can review before the workspace becomes the default signed-in destination.",
          "That disclosure is what turns a managed account into a transparent enterprise flow instead of an ambiguous policy surprise.",
        ],
      },
      {
        id: "dual-workspace-model",
        title: "Organization and personal workspace model",
        body: [
          "Employees can move through an organization workspace and the broader PayToCommit experience according to organization policy. The default landing view can be the organization workspace without erasing the employee’s normal account identity.",
          "This keeps the system enterprise-grade while preserving the single-account model across the platform.",
        ],
      },
      {
        id: "org-program-entry",
        title: "Organization program entry",
        body: [
          "The first-run path should introduce the employee to the organization’s markets, teams, required commitment programs, and relevant Ruzomi channels so the workspace already feels alive on first arrival.",
          "A polished organization onboarding flow should feel smaller and clearer than a long checklist while still making permissions, responsibilities, and next steps obvious.",
        ],
      },
    ],
    codeSample: {
      title: "Organization onboarding handoff",
      language: "json",
      code: `{
  "organization_id": "org_northstar_logistics",
  "employee_role": "manager",
  "workspace_default": "organization",
  "visibility_policy": "full_managed_account_visibility",
  "first_programs": ["dock-readiness", "handoff-audit", "safety-checks"]
}`,
      note: "Organization onboarding should clearly disclose role, visibility, and the first active programs before the employee lands inside the workspace.",
    },
  },
  {
    slug: ["organization-onboarding", "northstar-managed-account"],
    group: "Operations",
    title: "Organization Onboarding Detail",
    eyebrow: "Onboarding detail",
    summary:
      "A concrete managed-account onboarding path for one organization, showing role mapping, workspace destination, visibility disclosure, and first-market entry.",
    searchTerms: [
      "organization onboarding detail",
      "northstar managed account",
      "managed employee onboarding",
      "enterprise first run",
      "workspace default route",
    ],
    sections: [
      {
        id: "managed-start",
        title: "Managed start",
        body: [
          "A real organization onboarding detail page should show the exact organization, role template, default workspace destination, and first market programs the employee will see after approval.",
          "This is where enterprise onboarding becomes operational instead of abstract.",
        ],
      },
      {
        id: "policy-and-routing",
        title: "Policy and routing",
        body: [
          "The detail view should keep managed visibility policy, organization workspace routing, and any payroll-linked next steps visible so the employee and the admin owner share the same understanding.",
          "That prevents a messy split between what the company thinks it configured and what the employee actually experiences.",
        ],
      },
    ],
    codeSample: {
      title: "Managed onboarding detail payload",
      language: "json",
      code: `{
  "template_id": "northstar_managed_account",
  "default_workspace": "organization_workspace",
  "role_template": "operations_manager",
  "visibility_policy": "full_managed_account_visibility",
  "first_channels": ["general", "results", "handoff-audit"]
}`,
      note: "Managed onboarding detail should connect employee disclosure, workspace routing, and first-market participation in one view.",
    },
  },
  {
    slug: ["managed-visibility"],
    group: "Operations",
    title: "Managed Visibility Policy",
    eyebrow: "Visibility",
    summary:
      "How organization-managed accounts disclose what the company can see, what stays scoped to the employee, and how visibility templates are applied and audited.",
    searchTerms: [
      "managed visibility",
      "visibility policy",
      "organization visibility",
      "employee visibility scope",
      "full managed account visibility",
      "visibility template",
    ],
    sections: [
      {
        id: "policy-model",
        title: "Policy model",
        body: [
          "Managed visibility should never be hidden in fine print. The employee needs a clear explanation of what the organization can review, what remains outside scope, and which visibility template is being applied.",
          "The platform workspace should treat visibility policy as a first-class operational control instead of burying it in a generic role setting.",
        ],
      },
      {
        id: "auditability",
        title: "Auditability and change control",
        body: [
          "Visibility templates should be versioned, timestamped, and easy to compare so the company can prove what it disclosed and when it changed.",
          "That protects both the employee and the organization when permissions evolve over time.",
        ],
      },
    ],
    codeSample: {
      title: "Managed visibility template",
      language: "json",
      code: `{
  "visibility_template": "full_managed_account_visibility",
  "scope": [
    "org_markets",
    "assigned_programs",
    "permitted_global_markets"
  ],
  "disclosure_required": true,
  "audit_logged": true
}`,
      note: "Managed visibility should be explicit, disclosed, and auditable.",
    },
  },
  {
    slug: ["managed-visibility", "northstar-full-managed-visibility"],
    group: "Operations",
    title: "Managed Visibility Detail",
    eyebrow: "Visibility detail",
    summary:
      "A concrete visibility template view for one organization, including scope, disclosure timing, allowed manager review, and audit history.",
    searchTerms: [
      "managed visibility detail",
      "northstar visibility",
      "visibility template detail",
      "full managed account visibility",
    ],
    sections: [
      {
        id: "scope-view",
        title: "Scope view",
        body: [
          "The detail view should show exactly what the organization can review under the current template and which employee activities remain outside that scope.",
          "This is where an operator should verify policy before approving broad manager access or changing employee routing.",
        ],
      },
      {
        id: "disclosure-history",
        title: "Disclosure history",
        body: [
          "The template detail should also keep the disclosure timing, last revision, and active employee count visible so visibility policy never feels abstract.",
          "A real enterprise workspace needs these details on the screen, not buried behind an audit export.",
        ],
      },
    ],
    codeSample: {
      title: "Visibility template detail",
      language: "json",
      code: `{
  "template_id": "northstar_full_managed_visibility",
  "scope": "full_managed_account_visibility",
  "active_employees": 716,
  "last_disclosed_at": "2026-03-10T11:06:00Z",
  "manager_review_scope": "permitted_global_markets"
}`,
      note: "Visibility detail should connect policy scope, disclosure timing, and active employee coverage.",
    },
  },
  {
    slug: ["continuity-access"],
    group: "Operations",
    title: "Continuity Access",
    eyebrow: "Continuity",
    summary:
      "The access-protection lane that keeps employees connected to active commitments, proof windows, and deadlines even when organization access is reduced.",
    searchTerms: [
      "continuity access",
      "restore access",
      "employee restriction",
      "active commitments protection",
      "revocation continuity",
      "organization access restoration",
    ],
    sections: [
      {
        id: "continuity-rule",
        title: "Continuity rule",
        body: [
          "If an employee still has active commitments, the organization must not be able to strand that person away from deadlines, proof windows, or the market detail they still need to finish what is already in flight.",
          "Continuity access preserves the minimum rights required to complete active commitments while letting the company narrow broader workspace access if policy requires it.",
        ],
      },
      {
        id: "restore-access",
        title: "Restore access path",
        body: [
          "The continuity lane should show what must be restored, by when, and who currently owns the decision so managers understand the real cost of keeping a user restricted.",
          "A strong restore-access flow keeps deadlines visible and makes the safe path obvious instead of relying on policy memory alone.",
        ],
      },
    ],
    codeSample: {
      title: "Continuity access state",
      language: "json",
      code: `{
  "employee_id": "emp_jordan_lee",
  "access_state": "continuity_access",
  "active_commitments": 4,
  "nearest_deadline": "2026-03-15T16:00:00Z",
  "restore_owner": "manager.romero@northstar.example"
}`,
      note: "Continuity access protects active commitments while broader organization access is being reviewed.",
    },
  },
  {
    slug: ["continuity-access", "jordan-lee-restriction-window"],
    group: "Operations",
    title: "Continuity Access Detail",
    eyebrow: "Continuity detail",
    summary:
      "A specific restriction window showing why continuity access was preserved, what deadlines are still live, and what must happen before full revocation can complete.",
    searchTerms: [
      "continuity access detail",
      "restriction window",
      "restore access detail",
      "jordan lee continuity",
      "active commitments restore",
    ],
    sections: [
      {
        id: "restriction-window",
        title: "Restriction window",
        body: [
          "The detail surface should show the current access reduction, the reason that triggered it, and the exact active commitments that still require continuity protection.",
          "That keeps revocation decisions tied to real deadlines instead of abstract policy language.",
        ],
      },
      {
        id: "restore-deadline",
        title: "Restore deadline",
        body: [
          "A continuity detail page should make the next restore checkpoint obvious and show how the organization record will be affected if access is not restored in time.",
          "That turns continuity into a real operating safeguard, not a hidden footnote.",
        ],
      },
    ],
    codeSample: {
      title: "Restriction window detail",
      language: "json",
      code: `{
  "restriction_window_id": "jordan_lee_restriction_window",
  "employee_id": "emp_jordan_lee",
  "restricted_at": "2026-03-12T08:42:00Z",
  "continuity_access": true,
  "proof_windows_at_risk": 1,
  "restore_required_by": "2026-03-15T16:00:00Z"
}`,
      note: "Restriction detail should connect the access change to the commitments it still affects.",
    },
  },
  {
    slug: ["employee-access-queue"],
    group: "Operations",
    title: "Employee Access Queue",
    eyebrow: "Access",
    summary:
      "Approve company-email signups, review pending requests, revoke access with a reason, and keep active commitments from being orphaned.",
    searchTerms: [
      "employee access",
      "approval queue",
      "pending employees",
      "revoke employee access",
      "company email approval",
      "employee request queue",
    ],
    sections: [
      {
        id: "approval-queue",
        title: "Approval queue",
        body: [
          "The platform workspace can show every employee trying to join by company email in one searchable approval queue. Teams can approve individually, approve in bulk, or hold access until the right company owner reviews the request.",
          "The queue is built to stay readable under volume. Search, role filters, and status states make it usable whether the organization is onboarding fifty people or several thousand.",
        ],
      },
      {
        id: "policy-controls",
        title: "Policy controls",
        body: [
          "Company owners can allow or deny access by company email, role template, or specific employee policy. The queue can also show who is blocked from joining, who is waiting for a manager decision, and which requests are safe to approve in bulk.",
          "That keeps access review deliberate without turning the approval system into a maze. A clear queue, a clear search field, and a clear approval action matter more than endless configuration buried behind extra tabs.",
        ],
      },
      {
        id: "revocation-guardrails",
        title: "Revocation guardrails",
        body: [
          "Access can be revoked when policy requires it, but revocation must record a reason and show the downstream effect before it is confirmed. The system should not silently strand active commitments or hide a user's current obligations from both sides.",
          "If an employee still has active commitments, the workspace can place the account into a temporary restricted state while preserving visibility into what is still joined, what deadlines remain, and what must be restored before proof windows close.",
        ],
      },
      {
        id: "restoration-path",
        title: "Restoration path",
        body: [
          "If an employee is temporarily restricted while active commitments are still running, the workspace should show the deadlines that remain and the time window required to restore access cleanly. Employees can also request renewed access so the employer sees the pending follow-up in real time.",
          "That keeps revocation accountable. The platform should not let a company quietly bury an employee's active commitments and then claim the missed proof had no consequence.",
        ],
      },
      {
        id: "organization-hrs",
        title: "Organization-level HRS impact",
        body: [
          "Enterprise controls are not just access toggles. Approval delays, unresolved employee restrictions, and missed company commitments can also feed organization-level trust reporting where policy allows.",
          "That gives the employer a reason to keep the queue healthy and restore access in time, because the enterprise record should reflect how reliably the organization manages the commitments it asked its own people to take on.",
        ],
      },
    ],
    codeSample: {
      title: "Approve an employee request with a recorded reason",
      language: "json",
      code: `{
  "request_id": "emp_req_0184",
  "decision": "approve",
  "reviewed_by": "manager.romero@northstar.example",
  "reason": "Company email verified and role scope confirmed",
  "role_template": "team_member"
}`,
      note: "Approval, hold, restriction, and restoration actions should always preserve auditability and active-commitment visibility.",
    },
  },
  {
    slug: ["payroll-and-wallet"],
    group: "Operations",
    title: "Payroll and Commitment Wallet",
    eyebrow: "Payroll",
    summary:
      "How direct deposit, payroll-linked funding, employee wallet visibility, and the Commitment Wallet fit into an enterprise rollout.",
    searchTerms: [
      "payroll",
      "direct deposit",
      "commitment wallet",
      "employee wallet",
      "payroll funding",
      "salary deposit",
    ],
    sections: [
      {
        id: "direct-deposit-option",
        title: "Direct deposit option",
        body: [
          "Organizations can offer direct deposit into the Commitment Wallet as an optional payroll-connected path where policy and provider support allow it. This is an onboarding and payroll choice, not a forced requirement for employees.",
          "The workspace can explain the benefit clearly: funds can arrive directly into the employee's PayToCommit wallet, then move into commitment activity, payouts, and the rest of the wallet flow without extra manual steps.",
        ],
      },
      {
        id: "employee-wallet-entry",
        title: "Employee wallet entry",
        body: [
          "Payroll-linked wallet funding should feel like a clean extension of the normal PayToCommit wallet, not a separate banking app hidden inside the product. Employees can review available balance, funding timing, payout rules, and payroll-linked activity from the same wallet surface.",
          "That keeps wallet behavior understandable even when the employer is helping drive funding adoption.",
        ],
      },
      {
        id: "wallet-boundaries",
        title: "Wallet boundaries",
        body: [
          "The Commitment Wallet remains distinct from basic account login. Employers can support payroll-connected funding and organization markets, but the wallet still follows the published continuity-key, access, and recovery rules.",
          "That separation matters because payroll and commitment activity can intersect without turning the wallet into a generic employer-owned balance view.",
        ],
      },
      {
        id: "reporting-and-programs",
        title: "Employer reporting and programs",
        body: [
          "The enterprise workspace can review payroll-linked adoption, funding usage, and any approved organization program that shares value back to the company under the commercial package. Those views stay explicit about what is payroll, what is platform fee, and what belongs to the employer program.",
          "Finance and operations teams should be able to read the same truth without guessing which line item belongs to the wallet, which belongs to the payroll rail, and which belongs to the employer agreement.",
        ],
      },
      {
        id: "organization-reporting",
        title: "Employer reporting and fee visibility",
        body: [
          "The enterprise workspace can review payroll-linked adoption, employee funding usage, and organization-level revenue share or fee views where those commercial rules are enabled.",
          "Reporting should stay explicit about what is platform fee, what is payroll-linked settlement, and what belongs to the employer's commercial package so the flow remains understandable for both finance and operations teams.",
        ],
      },
    ],
    codeSample: {
      title: "Payroll-linked wallet configuration",
      language: "json",
      code: `{
  "organization_id": "org_northstar_logistics",
  "payroll_program": {
    "status": "active",
    "default_wallet_destination": "commitment_wallet",
    "direct_deposit_enabled": true,
    "employee_opt_in_required": true,
    "reporting_scope": "finance_and_operations"
  }
}`,
      note: "Payroll-linked funding is optional, employee-controlled where policy requires it, and still separated cleanly from normal wallet ownership.",
    },
  },
  {
    slug: ["workforce-rollout", "northstar-launch-q2"],
    group: "Operations",
    title: "Workforce Rollout Detail",
    eyebrow: "Rollout detail",
    summary:
      "A live rollout plan for company-email onboarding, employee approvals, organization channels, and direct-deposit readiness.",
    searchTerms: [
      "rollout detail",
      "employee launch plan",
      "workforce launch",
      "company onboarding plan",
      "northstar rollout",
    ],
    sections: [
      {
        id: "rollout-shape",
        title: "Rollout shape",
        body: [
          "A workforce rollout should show the exact company domains, onboarding template, permission model, and market groups the organization is preparing to launch.",
          "That gives operations, security, and the program owner one shared surface for understanding what is about to go live and which employees will be touched first.",
        ],
      },
      {
        id: "invite-readiness",
        title: "Invite and approval readiness",
        body: [
          "The detail view should keep invite batch size, approval owner, pending requests, and any blocked company-email ranges visible before the first employee invite goes out.",
          "That way the organization can see whether it is actually ready to onboard people instead of discovering missing approvals after employees already tried to join.",
        ],
      },
      {
        id: "program-links",
        title: "Program links",
        body: [
          "A rollout detail page should connect directly to the employee queue and payroll-linked wallet program that support the same launch. Those links keep setup work tied to the exact rollout instead of scattering it across unrelated admin views.",
          "That is especially important when one company is running several parallel workforce launches with different permissions, market groups, and onboarding templates.",
        ],
      },
    ],
    codeSample: {
      title: "Live workforce rollout payload",
      language: "json",
      code: `{
  "rollout_id": "wrk_rollout_q2_northstar",
  "organization_id": "org_northstar_logistics",
  "template": "northstar-launch-q2",
  "domains": ["northstar.example"],
  "invite_batch_size": 840,
  "pending_access_requests": 46,
  "blocked_company_aliases": 3,
  "next_launch_checkpoint": "2026-03-18T13:00:00Z"
}`,
      note: "A rollout detail view should combine launch readiness, employee access state, and the linked payroll/wallet program in one operator surface.",
    },
  },
  {
    slug: ["employee-access-queue", "northstar-q1-access-window"],
    group: "Operations",
    title: "Employee Access Queue Detail",
    eyebrow: "Queue detail",
    summary:
      "A detailed access-window view for company-email approvals, temporary restrictions, restoration deadlines, and organization HRS pressure.",
    searchTerms: [
      "queue detail",
      "employee approval detail",
      "restriction window",
      "restoration deadline",
      "company email detail",
    ],
    sections: [
      {
        id: "pending-window",
        title: "Pending access window",
        body: [
          "A queue detail surface should show exactly how many employees are waiting, which role templates they requested, and whether the current owner can approve the full batch safely.",
          "Search, filter, and bulk-approval controls matter most when the queue is active under real rollout pressure, not just when one or two employees are waiting.",
        ],
      },
      {
        id: "restriction-impact",
        title: "Restriction impact",
        body: [
          "When a company restricts a person who still has active commitments, the queue detail should surface every affected deadline, proof window, and restoration checkpoint before the restriction is confirmed.",
          "That preserves accountability. The organization should not be able to hide the operational cost of restricting access while commitments are still live.",
        ],
      },
      {
        id: "organization-pressure",
        title: "Organization trust pressure",
        body: [
          "If delayed approvals or unresolved restrictions begin to affect organization-level trust reporting, the queue detail should show that pressure directly. Operators should understand whether the queue is now a reliability risk, not just an admin backlog.",
          "That creates one place to review who is waiting, why they are waiting, and what still has to be restored before the company record takes a deeper hit.",
        ],
      },
    ],
    codeSample: {
      title: "Access queue detail payload",
      language: "json",
      code: `{
  "queue_window_id": "northstar_q1_access_window",
  "pending_requests": 46,
  "bulk_approvable": 29,
  "temporarily_restricted_with_active_commitments": 7,
  "nearest_restoration_deadline": "2026-03-15T16:00:00Z",
  "organization_hrs_pressure": "elevated"
}`,
      note: "The queue detail should make approval volume, active-commitment exposure, and restoration urgency visible without opening a second dashboard.",
    },
  },
  {
    slug: ["payroll-and-wallet", "northstar-direct-deposit-rollout"],
    group: "Operations",
    title: "Payroll Rollout Detail",
    eyebrow: "Payroll detail",
    summary:
      "A direct-deposit and wallet-adoption view for employee opt-in, linked payout rails, payroll timing, and wallet-access boundaries.",
    searchTerms: [
      "payroll rollout detail",
      "direct deposit rollout",
      "wallet adoption",
      "employee wallet detail",
      "payroll program detail",
    ],
    sections: [
      {
        id: "adoption-shape",
        title: "Adoption and opt-in",
        body: [
          "A payroll rollout detail page should show how many employees have opted into direct deposit, how many still need wallet setup, and which teams are driving adoption fastest.",
          "That gives payroll and operations one shared view into how the program is landing without hiding the employee choice model that keeps the wallet optional.",
        ],
      },
      {
        id: "wallet-boundaries",
        title: "Wallet access boundary",
        body: [
          "Even when payroll funds can land in the Commitment Wallet, the wallet still follows its own local-password, biometric, and Continuity Key rules. Payroll enrollment should never be mistaken for employer-owned wallet access.",
          "That separation keeps payroll convenience from blurring the recovery boundary or the user's control over wallet-sensitive actions.",
        ],
      },
      {
        id: "finance-view",
        title: "Finance and operator view",
        body: [
          "The payroll detail should show direct-deposit timing, linked payout rails, funding adoption, and the employer program line items in one place. Finance teams need to see what is payroll, what is platform fee, and what belongs to the employer agreement without cross-referencing multiple tools.",
          "Operators should also be able to jump from the payroll rollout into employee access and company-market rollout so the three workforce lanes stay connected.",
        ],
      },
    ],
    codeSample: {
      title: "Payroll rollout detail payload",
      language: "json",
      code: `{
  "program_id": "northstar_direct_deposit_rollout",
  "employee_opt_in_rate": "38%",
  "wallet_setup_complete": 312,
  "linked_payout_rails": 208,
  "next_payroll_window": "2026-03-15T09:00:00Z",
  "employer_program_state": "active"
}`,
      note: "Payroll rollout detail should combine adoption, wallet readiness, and payout-rail coverage without crossing the wallet recovery boundary.",
    },
  },
  {
    slug: ["organization-fees"],
    group: "Operations",
    title: "Organization Program Economics",
    eyebrow: "Program economics",
    summary:
      "The employer-side fee and revenue-share lane for organization programs, payroll-linked rollout, and company-managed market participation.",
    searchTerms: [
      "organization fees",
      "organization revenue share",
      "program economics",
      "employer fee",
      "enterprise billing economics",
      "organization program fee",
    ],
    sections: [
      {
        id: "what-this-layer-is",
        title: "What this economics layer is",
        body: [
          "Organization program economics should stay separate from Sovereign Spark. The company-side program fee or revenue-share lane is an enterprise commercial layer, not the core platform fee that funds the product itself.",
          "That separation keeps billing honest for both the employer and the employee while preserving the platform’s own unit economics.",
        ],
      },
      {
        id: "what-employers-see",
        title: "What the employer should see",
        body: [
          "A strong program-economics page should show organization fee settings, payroll-linked program line items, rebate or share summaries where contractually enabled, and the difference between employer-side economics and employee-facing market or funding fees.",
          "Finance and operations should be able to read this page without cross-referencing three different billing systems.",
        ],
      },
      {
        id: "why-it-needs-its-own-lane",
        title: "Why it needs its own lane",
        body: [
          "Employer economics is important enough to deserve its own lane because it shapes rollout decisions, payroll activation, and contract review. If it hides inside generic billing totals, no one can explain what the employer is actually paying for.",
          "The right page makes the agreement legible and keeps the next billing or contract action obvious.",
        ],
      },
    ],
    codeSample: {
      title: "Organization economics summary",
      language: "json",
      code: `{
  "organization_id": "org_northstar_logistics",
  "organization_program_fee": 0.018,
  "revenue_share_mode": "enabled",
  "payroll_programs": 1,
  "monthly_program_total_usd": 4180.24
}`,
      note: "Organization economics should stay explicit, separate from Sovereign Spark, and easy to audit.",
    },
  },
  {
    slug: ["organization-fees", "northstar-program-share"],
    group: "Operations",
    title: "Organization Economics Detail",
    eyebrow: "Economics detail",
    summary:
      "A contract-backed view of employer-side fee configuration, rollout-linked economics, and the current billing shape for one organization program.",
    searchTerms: [
      "program share detail",
      "organization economics detail",
      "northstar program share",
      "employer revenue share",
    ],
    sections: [
      {
        id: "line-items",
        title: "Line items and contract posture",
        body: [
          "An economics detail page should break employer-side value into clean line items: active organization programs, payroll-linked funding, eligible revenue-share lanes, and any contract-specific adjustments or credits.",
          "It should never force the company to guess whether a number belongs to the platform core fee, the employer program layer, or a payroll-specific configuration.",
        ],
      },
      {
        id: "operating-context",
        title: "Economics in operating context",
        body: [
          "This page should also stay tied to the actual rollout, employee cohort, and organization markets it supports. That way the company can connect cost to activity instead of reading one disconnected invoice table.",
          "Good enterprise economics pages make the commercial picture explainable to finance, operations, and procurement at the same time.",
        ],
      },
      {
        id: "next-actions",
        title: "What comes next",
        body: [
          "From here, the company should be able to move into billing, exports, payroll rollout, or the underlying organization workspace without losing the current contract context.",
          "That keeps commercial review practical instead of turning it into a dead-end finance screen.",
        ],
      },
    ],
  },
  {
    slug: ["employees"],
    group: "Operations",
    title: "Employee Directory",
    eyebrow: "Employees",
    summary:
      "Search the organization directory, review employee roles and access state, and move from approvals into person-level commitment operations.",
    searchTerms: [
      "employee directory",
      "employees",
      "organization staff",
      "employee search",
      "employee detail",
      "team directory",
    ],
    sections: [
      {
        id: "directory-purpose",
        title: "Directory purpose",
        body: [
          "The employee directory is the operating surface that ties company-email onboarding, organization roles, current commitments, and access state into one searchable lane.",
          "Managers and admins should not need to jump between approvals, payroll, and commitment history just to understand what one employee can currently do.",
        ],
      },
      {
        id: "employee-states",
        title: "Employee states",
        body: [
          "Each employee record can show whether the person is invited, active, pending approval, temporarily restricted, or in continuity access mode while active commitments remain open.",
          "That state makes the directory useful for real operations instead of reducing it to a static member list.",
        ],
      },
      {
        id: "team-operations",
        title: "Team operations",
        body: [
          "The directory should support role review, team filtering, manager-level oversight, and quick jumps into employee detail so a company can work from the roster it actually operates every day.",
          "That is what turns the organization workspace into a real control center instead of a one-time onboarding tool.",
        ],
      },
    ],
    codeSample: {
      title: "Employee directory slice",
      language: "json",
      code: `{
  "organization_id": "org_northstar_logistics",
  "employees": 842,
  "active": 716,
  "pending": 46,
  "continuity_access": 7,
  "directory_filters": ["role", "team", "status", "manager"]
}`,
      note: "A real employee directory should stay searchable, stateful, and linked directly to approval, payroll, and commitment operations.",
    },
  },
  {
    slug: ["employees", "jordan-lee"],
    group: "Operations",
    title: "Employee Detail",
    eyebrow: "Employee detail",
    summary:
      "A manager-grade employee record with role, access state, current commitments, organization-market history, HRS trajectory, and payroll-linked setup.",
    searchTerms: [
      "employee detail",
      "jordan lee",
      "employee profile",
      "employee commitment history",
      "employee hrs",
    ],
    sections: [
      {
        id: "access-and-role",
        title: "Access and role posture",
        body: [
          "An employee detail page should make role, team, manager, access state, and continuity protections visible before the operator takes any action.",
          "That prevents policy decisions from being made blindly when the employee still has live commitments, pending proof windows, or payroll-linked wallet setup in progress.",
        ],
      },
      {
        id: "commitment-history",
        title: "Commitment history",
        body: [
          "The page should show current commitments, completed commitments, missed commitments, and organization-specific program history with trend context rather than a flat list.",
          "Managers need to understand whether the employee is rising, plateauing, or recovering, not just whether one market finished green or red.",
        ],
      },
      {
        id: "org-operations",
        title: "Organization operations",
        body: [
          "The employee detail should stay tied to approval history, payroll enrollment, and visibility policy so an organization can explain exactly what the employee sees and what the company can review.",
          "That makes the page operationally useful for onboarding, interventions, and organization-market planning.",
        ],
      },
    ],
    codeSample: {
      title: "Employee detail record",
      language: "json",
      code: `{
  "employee_id": "emp_jordan_lee",
  "role": "Manager",
  "team": "Warehouse Operations",
  "status": "active",
  "current_commitments": 4,
  "completed_commitments": 29,
  "missed_commitments": 2,
  "hrs_trend": "recovering",
  "payroll_direct_deposit": "enrolled"
}`,
      note: "Employee detail should connect role, access, commitment trajectory, and organization controls in one person-level surface.",
    },
  },
  {
    slug: ["reports"],
    group: "Operations",
    title: "Reports and Exports",
    eyebrow: "Reports",
    summary:
      "Portfolio reports, export jobs, cohort comparisons, and audit-ready packages for finance, risk, and compliance teams.",
    searchTerms: [
      "reports",
      "exports",
      "csv",
      "pdf",
      "cohorts",
      "audit package",
      "scheduled reports",
    ],
    sections: [
      {
        id: "report-types",
        title: "Report types",
        body: [
          "The reporting view covers customer exports, portfolio summaries, cohort comparisons, webhook delivery summaries, billing usage reports, and historical snapshots.",
          "Every report remains linked to the requesting organization, the requesting user, and the consent scope that made the underlying records visible.",
        ],
      },
      {
        id: "scheduled-workflows",
        title: "Scheduled workflows",
        body: [
          "Teams can schedule repeat reports, route them to finance or compliance owners, and keep retries, failures, and delivery history visible in the same workspace.",
          "That keeps the reporting system operational instead of forcing teams to trust a hidden background job they cannot inspect.",
        ],
      },
      {
        id: "audit-ready-exports",
        title: "Audit-ready exports",
        body: [
          "Audit packages bundle the visible portfolio slice, the consent metadata, and the relevant access history together so the downstream reviewer sees the full story.",
          "It is the difference between a polished-looking dashboard and a platform that can actually stand up under enterprise review.",
        ],
      },
      {
        id: "scheduled-delivery",
        title: "Scheduled delivery and status",
        body: [
          "Reports should not disappear into a background queue with no status. Operators need to see whether a report is preparing, delivered, retried, corrected, or waiting on new data.",
          "That is especially true for finance, audit, and compliance workflows where the report itself becomes a formal operating artifact.",
        ],
      },
    ],
    codeSample: {
      title: "Create a scheduled portfolio export",
      language: "json",
      code: `{
  "report_type": "portfolio_summary",
  "delivery": "weekly",
  "format": ["csv", "pdf"],
  "filters": {
    "segment": "underwriting_review",
    "consent_scope": "hrs.lookup.identity"
  },
  "recipients": ["risk@northstar.example", "finance@northstar.example"]
}`,
      note: "Reports and exports should keep schedule, status, recipients, and scope visible from the same operator surface.",
    },
  },
  {
    slug: ["reports", "compliance-audit-package"],
    group: "Operations",
    title: "Compliance Audit Package",
    eyebrow: "Report detail",
    summary:
      "The detailed report workflow for compliance-ready audit packages, including queued state, approval context, delivery status, and correction handling.",
    searchTerms: [
      "audit package",
      "report detail",
      "correction flow",
      "report delivery",
      "compliance export",
      "scheduled package",
    ],
    sections: [
      {
        id: "state-machine",
        title: "Report state machine",
        body: [
          "A serious report lane shows preparing, delivered, retrying, correction-required, and archived states directly on the workflow itself instead of hiding that detail behind a generic download button.",
          "That gives operators a clear way to understand what is ready, what is blocked, and what still needs attention before a package is relied on externally.",
        ],
      },
      {
        id: "delivery-and-corrections",
        title: "Delivery and correction handling",
        body: [
          "Audit packages should keep their delivery target, last successful handoff, failure reason, and correction path visible from the same screen.",
          "If a package needs correction, the operator should be able to reopen the scope, issue a corrected export, and keep the full audit chain intact.",
        ],
      },
      {
        id: "linked-billing",
        title: "Billing and export cost",
        body: [
          "Heavy exports and scheduled packages can drive real usage, so the workflow should surface the billable shape of the report without forcing operators to leave the reporting lane.",
          "That keeps finance, compliance, and technical owners aligned on both operational readiness and cost concentration.",
        ],
      },
      {
        id: "owner-chain",
        title: "Owner chain and approvals",
        body: [
          "A compliance package should always show who requested it, who owns the next approval step, and whether the current delivery is safe to rely on. That makes the report detail page feel like a real workflow instead of a passive download history.",
          "If a correction is required, the same owner chain should stay visible through the corrected run so the audit trail remains understandable later.",
        ],
      },
    ],
    codeSample: {
      title: "Compliance package workflow state",
      language: "json",
      code: `{
  "report_id": "rep_compliance_audit_package",
  "status": "preparing",
  "requested_by": "rumiz@northstarlogistics.com",
  "delivery_target": "compliance@northstarlogistics.com",
  "last_successful_delivery_at": "2026-02-29T08:00:00Z",
  "billable_units": {
    "report_runs": 1,
    "export_rows": 12842
  },
  "correction_window_open": true
}`,
      note: "Report detail should make state, delivery, and correction readiness obvious from the first screen.",
    },
  },
  {
    slug: ["reports", "operations-digest"],
    group: "Operations",
    title: "Organization Operations Digest",
    eyebrow: "Operations digest",
    summary:
      "A scheduled digest for workforce rollout, approvals, continuity windows, org-market health, payroll adoption, and manager-owned team pressure.",
    searchTerms: [
      "operations digest",
      "organization report",
      "employee operations report",
      "workforce digest",
      "manager digest",
    ],
    sections: [
      {
        id: "what-it-covers",
        title: "What the digest covers",
        body: [
          "The organization operations digest should gather the metrics leaders actually review together: pending approvals, continuity windows, org-market performance, payroll adoption, team pressure, and recent employee recovery movement.",
          "That makes it the best report for leaders who care about organization execution, not just API traffic or billing.",
        ],
      },
      {
        id: "delivery-shape",
        title: "How it should be delivered",
        body: [
          "A good digest should work as an export, a dashboard panel, and a scheduled delivery to operations or finance owners. The point is to keep the company aligned without asking every leader to navigate the full workspace every day.",
          "Because the digest is tied to the real operating model, it should also route back into the queue, roster, and org-market lanes that explain the numbers.",
        ],
      },
      {
        id: "why-it-matters",
        title: "Why this report matters",
        body: [
          "This is the report that makes the organization program feel governable. It shows whether the company is onboarding people cleanly, protecting active commitments, and maintaining real execution quality across teams.",
          "That makes it different from a finance export or an audit package. It is a management report.",
        ],
      },
    ],
  },
  {
    slug: ["reports", "billing-reconciliation"],
    group: "Operations",
    title: "Billing Reconciliation",
    eyebrow: "Report detail",
    summary:
      "A finance-grade reconciliation package for HRS usage, exports, employer program economics, and statement-ready variance review.",
    searchTerms: [
      "billing reconciliation",
      "finance reconciliation",
      "usage reconciliation",
      "program economics reconciliation",
      "invoice variance",
    ],
    sections: [
      {
        id: "what-reconciliation-covers",
        title: "What reconciliation covers",
        body: [
          "Billing reconciliation compares protected lookups, reports, exports, employer-fee programs, and statement lines against the current billing posture.",
          "It exists so finance and operators can see whether the numbers line up before invoices or employer-facing statements are finalized.",
        ],
      },
      {
        id: "variance-review",
        title: "Variance review",
        body: [
          "A good reconciliation page should show variance, owner, and next action instead of forcing the team into raw ledger exports every time a number moves.",
          "That makes the report useful as an operating lane, not just a data dump.",
        ],
      },
      {
        id: "where-it-routes",
        title: "Where this page routes next",
        body: [
          "From here teams should be able to jump into billing, exports, audit history, or the organization-fee lane that generated the variance.",
          "That keeps reconciliation tied to the actual sources of movement instead of turning it into a dead-end finance screen.",
        ],
      },
    ],
    codeSample: {
      title: "Billing reconciliation snapshot",
      language: "json",
      code: `{
  "period": "2026-03",
  "usage_billed_usd": 4318.42,
  "program_fees_billed_usd": 912.13,
  "variance_usd": 14.27,
  "status": "needs_review",
  "owner": "finance@northstar.example"
}`,
      note: "Billing reconciliation should explain what moved, how much it moved, and who is responsible for closing the gap.",
    },
  },
  {
    slug: ["billing-usage"],
    group: "Operations",
    title: "Billing and Usage",
    eyebrow: "Billing",
    summary:
      "Usage-metered HRS lookups, report jobs, export volume, webhook activity, and organization-level spend from one enterprise billing surface.",
    searchTerms: [
      "billing usage",
      "usage meter",
      "lookup volume",
      "organization spend",
      "invoice preview",
      "billing dashboard",
    ],
    sections: [
      {
        id: "usage-model",
        title: "Usage model",
        body: [
          "Usage billing follows the real enterprise primitives: successful HRS lookups, expanded-history retrievals, export jobs, report runs, and webhook volume where policy applies.",
          "That keeps the commercial model tied to the operational value customers actually consume instead of forcing everything into a seat count.",
        ],
      },
      {
        id: "visibility",
        title: "Visibility by project and tenant",
        body: [
          "The billing surface breaks usage down by organization, project, environment, report job, and export workload so finance and engineering can see the same truth from different angles.",
          "Threshold alerts, invoice previews, and per-key consumption stay close to the platform dashboard instead of hiding in a separate finance-only page.",
        ],
      },
      {
        id: "economics-discipline",
        title: "Economics discipline",
        body: [
          "The platform also keeps high-cost workflows visible so teams understand when heavier reports, exports, or assisted review flows are driving the bill.",
          "That leads to predictable spend and fewer surprises once an organization moves from sandbox to production volume.",
        ],
      },
      {
        id: "invoice-preview",
        title: "Invoice preview and thresholds",
        body: [
          "Billing should expose the next invoice shape before the month closes. Threshold alerts, cost concentration by project, and report-heavy usage spikes should all stay visible to both technical and finance owners.",
          "That makes usage billing feel operationally safe instead of mysterious, especially once multiple projects and exports start moving at the same time.",
        ],
      },
    ],
    codeSample: {
      title: "Billing usage summary",
      language: "json",
      code: `{
  "period": "2026-03",
  "lookups": 11284,
  "expanded_history_calls": 904,
  "report_jobs": 37,
  "webhook_deliveries": 182114,
  "project_breakdown": [
    { "project": "sandbox-workforce-review", "cost_usd": 428.11 },
    { "project": "production-underwriting", "cost_usd": 2984.42 }
  ]
}`,
      note: "Usage billing should stay transparent by project, workload, and period so teams can explain the bill without leaving the workspace.",
    },
  },
  {
    slug: ["billing-usage", "production-underwriting"],
    group: "Operations",
    title: "Project Billing Detail",
    eyebrow: "Billing detail",
    summary:
      "A project-level billing lane showing spend concentration, workflow mix, threshold pressure, and the next actions needed before month-end.",
    searchTerms: [
      "project billing",
      "usage concentration",
      "threshold alert",
      "invoice pressure",
      "underwriting project",
      "workflow spend",
    ],
    sections: [
      {
        id: "concentration",
        title: "Spend concentration",
        body: [
          "Project billing detail should make it obvious when one live integration, one export-heavy workflow, or one dashboard cohort is carrying most of the monthly bill.",
          "That lets technical and finance owners intervene early instead of discovering the pattern only after invoicing closes.",
        ],
      },
      {
        id: "workflow-mix",
        title: "Workflow mix",
        body: [
          "The page should break usage into protected lookups, dashboard-heavy sessions, scheduled reports, webhook events, and any assisted review workload that changes the cost profile.",
          "That keeps the billing surface tied to real product behavior instead of presenting one opaque usage total.",
        ],
      },
      {
        id: "next-actions",
        title: "Next actions",
        body: [
          "Project owners should be able to rotate a key, tighten a threshold, move a heavy workflow to a separate project, or review report cadence from the same page.",
          "That is the difference between a serious platform billing console and a static invoice summary.",
        ],
      },
      {
        id: "owner-rhythm",
        title: "Owner rhythm",
        body: [
          "The billing lane should show who owns the current review window, when the next threshold or invoice checkpoint arrives, and what the most likely optimization move is. That turns billing into an operating lane rather than a static report.",
          "The best enterprise billing pages do not stop at a total. They tell the team which owner is up next and what they should examine first.",
        ],
      },
    ],
    codeSample: {
      title: "Project usage concentration snapshot",
      language: "json",
      code: `{
  "project": "production-underwriting",
  "period": "2026-03",
  "total_cost_usd": 2984.42,
  "largest_workflow": "protected_lookup_batch",
  "threshold_alerts": 2,
  "mix": {
    "protected_lookups": 0.62,
    "reports_and_exports": 0.21,
    "dashboard_workflows": 0.11,
    "webhooks": 0.06
  }
}`,
      note: "Project billing detail should reveal where spend is coming from and what the operator should adjust next.",
    },
  },
  {
    slug: ["audit-logs"],
    group: "Operations",
    title: "Audit Logs and Access History",
    eyebrow: "Audit",
    summary:
      "Trace consent-backed lookups, exports, scope changes, and admin actions with a full enterprise access history.",
    searchTerms: [
      "audit logs",
      "access history",
      "consent history",
      "admin actions",
      "scope changes",
      "export history",
    ],
    sections: [
      {
        id: "logged-events",
        title: "What is logged",
        body: [
          "Audit history records customer lookups, export jobs, consent changes, scope checks, key usage, webhook verification, and high-sensitivity admin actions.",
          "Each record keeps the actor, timestamp, declared purpose, and affected project or customer context when that applies.",
        ],
      },
      {
        id: "review-workflows",
        title: "Review workflows",
        body: [
          "Audit filters help teams answer the real operational questions: who queried this customer, which consent scope was active, and what changed before the current dashboard view became visible.",
          "The same history supports security review, finance review, and customer-facing corrections when policy requires them.",
        ],
      },
      {
        id: "audit-exports",
        title: "Audit exports",
        body: [
          "Teams can export a bounded slice of access history for an incident, an internal review, or a compliance request without flattening the whole organization into one unreadable file.",
          "That makes the audit page useful in practice instead of being a dead-end log viewer.",
        ],
      },
    ],
  },
  {
    slug: ["audit-logs", "organization-access-review"],
    group: "Operations",
    title: "Organization Access Review",
    eyebrow: "Audit detail",
    summary:
      "A bounded audit slice for role grants, revocations, continuity protections, restore actions, and managed-visibility changes.",
    searchTerms: [
      "organization access review",
      "role grant audit",
      "revocation audit",
      "restore access audit",
      "managed visibility audit",
    ],
    sections: [
      {
        id: "what-this-review-shows",
        title: "What this review shows",
        body: [
          "The organization access review focuses on the highest-sensitivity changes: role grants, visibility-policy changes, revocations, restore actions, and continuity protections.",
          "It is the audit slice operators use when they need to explain exactly how an employee or manager reached the access state they are in now.",
        ],
      },
      {
        id: "why-this-matters",
        title: "Why this matters",
        body: [
          "Company-managed workspaces only stay trustworthy if access changes are explainable. A role or visibility change that cannot be traced is already an operational problem.",
          "That is why this view should be bounded, high-signal, and tied directly to the queue, employee, and visibility surfaces it refers to.",
        ],
      },
      {
        id: "how-it-is-used",
        title: "How teams use it",
        body: [
          "Teams use the access review when they are reconciling a restore window, investigating an unexpected visibility state, or proving that a manager/admin change was lawful and intentional.",
          "It should feel like a serious operator surface, not a generic flat log.",
        ],
      },
    ],
    codeSample: {
      title: "Organization access review export",
      language: "json",
      code: `{
  "organization_id": "org_northstar_logistics",
  "window": "2026-03-01/2026-03-12",
  "events": [
    "manager_role_granted",
    "employee_access_restricted",
    "continuity_mode_enabled",
    "restore_access_completed",
    "managed_visibility_updated"
  ]
}`,
      note: "Access review should isolate the highest-sensitivity organization access changes in one bounded exportable audit slice.",
    },
  },
  {
    slug: ["troubleshooting"],
    group: "Operations",
    title: "Troubleshooting",
    eyebrow: "Troubleshooting",
    summary:
      "Diagnose invalid consent state, scope mismatch, webhook verification failures, billing anomalies, and organization-level integration issues.",
    searchTerms: [
      "troubleshooting",
      "scope mismatch",
      "invalid consent",
      "billing anomaly",
      "webhook failure",
      "support",
    ],
    sections: [
      {
        id: "common-issues",
        title: "Common issues",
        body: [
          "The most common failures come from expired consent scope, unsupported lookup purpose, stale webhook secrets, and environment mismatch between sandbox and production.",
          "The troubleshooting guide explains how to isolate the failing step before a request reaches support or enterprise review.",
        ],
      },
      {
        id: "support-path",
        title: "Critical help path",
        body: [
          "Critical funding, payout, enterprise, and identity support paths stay reachable even when direct Galactus access is not active.",
          "The portal links directly into those support and sales surfaces so a blocked team can still keep moving without losing context.",
        ],
      },
    ],
  },
  {
    slug: ["strategic-partners"],
    group: "Operations",
    title: "Strategic Partners",
    eyebrow: "Partners",
    summary:
      "Optional flagship partnership packages for negotiated enterprise accounts that want launch support, case studies, or co-branded rollout assets.",
    searchTerms: [
      "strategic partners",
      "flagship contract",
      "launch partner",
      "case study",
      "co-branded rollout",
      "partner package",
    ],
    sections: [
      {
        id: "optional-path",
        title: "Optional, not required",
        body: [
          "A strategic partner package is a negotiated path for selected enterprise accounts. It is never required to buy or use the HRS API.",
          "Most customers move through the normal developer and enterprise workflow with no public announcement requirement at all.",
        ],
      },
      {
        id: "what-it-can-include",
        title: "What it can include",
        body: [
          "Strategic partner packages can include co-branded launch pages, case studies, launch-partner badges, integration spotlights, and executive-ready rollout materials.",
          "Everything in that package stays subject to legal review, communications review, and explicit approval before anything becomes public.",
        ],
      },
      {
        id: "when-it-makes-sense",
        title: "When it makes sense",
        body: [
          "This path fits teams that want a visible rollout, a flagship customer story, or a stronger public trust signal around their integration.",
          "If a customer only wants the API, the dashboard, billing, and support, the standard enterprise path is already enough.",
        ],
      },
    ],
  },
  {
    slug: ["changelog"],
    group: "Operations",
    title: "Changelog",
    eyebrow: "Changelog",
    summary:
      "Track endpoint additions, schema changes, dashboard upgrades, billing updates, and developer-platform releases before they hit production workflows.",
    searchTerms: [
      "changelog",
      "releases",
      "schema changes",
      "dashboard upgrades",
      "developer portal updates",
    ],
    sections: [
      {
        id: "release-policy",
        title: "Release policy",
        body: [
          "The changelog records versioned endpoint changes, webhook event additions, dashboard/reporting upgrades, and policy changes that affect enterprise integrations.",
          "Use it before upgrading a production integration or enabling a new dashboard or report flow at organization level.",
        ],
      },
      {
        id: "alerting",
        title: "Operational alerting",
        body: [
          "Breaking or high-impact updates are announced before rollout and stay visible alongside current health and status surfaces.",
          "Status updates, docs updates, and the changelog work together so the platform never relies on hidden release behavior.",
        ],
      },
    ],
  },
];

export function getDeveloperPortalPageBySlug(slug: string[]) {
  return developerPortalPages.find((page) => page.slug.join("/") === slug.join("/")) ?? developerPortalPages[0];
}

export function getDeveloperPortalPath(
  slug: string[],
  hostMode: "path" | "developers" | "platform" = "path",
) {
  const joined = slug.join("/");
  if (hostMode === "path") {
    return joined ? `/developers/${joined}` : "/developers";
  }
  return joined ? `/${joined}` : "/";
}

export function getDeveloperPortalSearchResults(query: string) {
  const normalized = query.toLowerCase().trim();

  if (!normalized) {
    return developerPortalPages.map<DocsSearchResult>((page) => ({
      slug: page.slug,
      title: page.title,
      summary: page.summary,
      group: page.group,
      match: page.summary,
    }));
  }

  return developerPortalPages
    .map<DocsSearchResult | null>((page) => {
      const haystack = [
        page.title,
        page.summary,
        page.group,
        ...page.searchTerms,
        ...page.sections.flatMap((section) => [section.title, ...section.body]),
      ];
      const matched = haystack.find((entry) => entry.toLowerCase().includes(normalized));

      if (!matched) {
        return null;
      }

      return {
        slug: page.slug,
        title: page.title,
        summary: page.summary,
        group: page.group,
        match: matched,
      };
    })
    .filter((page): page is DocsSearchResult => Boolean(page));
}
