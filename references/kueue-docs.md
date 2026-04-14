Chapter 8. Managing workloads with Kueue 

As a cluster administrator, you can manage AI and machine learning workloads at scale by integrating the Red Hat build of Kueue with Red Hat OpenShift AI. This integration provides capabilities for quota management, resource allocation, and prioritized job scheduling.

Important
Starting with OpenShift AI 2.24, the embedded Kueue component for managing distributed workloads is deprecated. Kueue is now provided through Red Hat build of Kueue, which is installed and managed by the Red Hat build of Kueue Operator. You cannot install both the embedded Kueue and the Red Hat build of Kueue Operator on the same cluster because this creates conflicting controllers that manage the same resources.

OpenShift AI does not automatically migrate existing workloads. To ensure your workloads continue using queue management after upgrading, cluster administrators must manually migrate from the embedded Kueue to the Red Hat build of Kueue Operator. For more information, see Migrating to the Red Hat build of Kueue Operator.

8.1. Overview of managing workloads with Kueue 

You can use Kueue in OpenShift AI to manage AI and machine learning workloads at scale. Kueue controls how cluster resources are allocated and shared through hierarchical quota management, dynamic resource allocation, and prioritized job scheduling. These capabilities help prevent cluster contention, ensure fair access across teams, and optimize the use of heterogeneous compute resources, such as hardware accelerators.

Kueue lets you schedule diverse workloads, including distributed training jobs (RayJob, RayCluster, PyTorchJob), workbenches (Notebook), and model serving (InferenceService). Kueue validation and queue enforcement apply only to workloads in namespaces with the kueue.openshift.io/managed=true label.

Using Kueue in OpenShift AI provides these benefits:

Prevents resource conflicts and prioritizes workload processing
Manages quotas across teams and projects
Ensures consistent scheduling for all workload types
Maximizes GPU and other specialized hardware utilization
Important
Starting with OpenShift AI 2.24, the embedded Kueue component for managing distributed workloads is deprecated. Kueue is now provided through Red Hat build of Kueue, which is installed and managed by the Red Hat build of Kueue Operator. You cannot install both the embedded Kueue and the Red Hat build of Kueue Operator on the same cluster because this creates conflicting controllers that manage the same resources.

OpenShift AI does not automatically migrate existing workloads. To ensure your workloads continue using queue management after upgrading, cluster administrators must manually migrate from the embedded Kueue to the Red Hat build of Kueue Operator. For more information, see Migrating to the Red Hat build of Kueue Operator.

8.1.1. Kueue management states 

You configure how OpenShift AI interacts with Kueue by setting the managementState in the DataScienceCluster object.

Unmanaged
This state is supported for using Kueue with OpenShift AI. In Unmanaged state, OpenShift AI integrates with an existing Kueue installation managed by the Red Hat build of Kueue Operator. You must have the Red Hat build of Kueue Operator installed and running on the cluster.

When you enable Unmanaged mode, the OpenShift AI Operator creates a default Kueue custom resource (CR) if one does not already exist. This prompts the Red Hat build of Kueue Operator to activate Kueue on the cluster.

Managed
This state is deprecated. Previously, OpenShift AI deployed and managed an embedded Kueue distribution. Managed mode is not compatible with the Red Hat build of Kueue Operator. If both are installed, OpenShift AI stops reconciliation to avoid conflicts. You must migrate any environment using the Managed state to the Unmanaged state to ensure continued support.
Removed
This state disables Kueue in OpenShift AI. If the state was previously Managed, OpenShift AI uninstalls the embedded Kueue distribution. If the state was previously Unmanaged, OpenShift AI stops checking for the external Kueue integration but does not uninstall the Red Hat build of Kueue Operator. An empty managementState value also functions as Removed.
8.1.2. Queue enforcement for projects 

To ensure workloads do not bypass the queuing system, a validating webhook automatically enforces queuing rules on any project that is enabled for Kueue management. You enable a project for Kueue management by applying the kueue.openshift.io/managed=true label to the project namespace.

Note
This validating webhook enforcement method replaces the Validating Admission Policy that was used with the deprecated embedded Kueue component. The system also supports the legacy kueue-managed label for backward compatibility, but kueue.openshift.io/managed=true is the recommended label going forward.

After a project is enabled for Kueue management, the webhook requires that any new or updated workload has the kueue.x-k8s.io/queue-name label. If this label is missing, the webhook prevents the workload from being created or updated.

OpenShift AI creates a default, cluster-scoped ClusterQueue (if one does not already exist) and a namespace-scoped LocalQueue for that namespace (if one does not already exist). These default resources are created with the opendatahub.io/managed=false annotation, so they are not managed after creation. Cluster administrators can change or delete them.

The webhook enforces this rule on the create and update operations for the following resource types:

InferenceService
Notebook
PyTorchJob
RayCluster
RayJob
Note
You can apply hardware profiles to other workload types, but the validation webhook enforces the kueue.x-k8s.io/queue-name label requirement only for these specific resource types.

8.1.3. Restrictions for managing workloads with Kueue 

When you use Kueue to manage workloads in OpenShift AI, the following restrictions apply:

Namespaces must be labeled with kueue.openshift.io/managed=true to enable Kueue validation and queue enforcement.
All workloads that you create from the OpenShift AI dashboard, such as workbenches and model servers, must use a hardware profile that specifies a local queue.
When you specify a local queue in a hardware profile, OpenShift AI automatically applies the corresponding kueue.x-k8s.io/queue-name label to workloads that use that profile.
You cannot use hardware profiles that contain node selectors or tolerations for node placement. To direct workloads to specific nodes, use a hardware profile that specifies a local queue that is associated with a queue configured with the appropriate resource flavors.
Because workbenches are not suspendable workloads, you can only assign them to a local queue that is associated with a non-preemptive cluster queue. The default cluster queue that OpenShift AI creates is non-preemptive.
Additional resources

Red Hat build of Kueue documentation
8.1.4. Kueue workflow 

Managing workloads with Kueue in OpenShift AI involves tasks for OpenShift cluster administrators, OpenShift AI administrators, and machine learning (ML) engineers or data scientists:

Cluster administrator

Installs and configures Kueue:

Installs the Red Hat build of Kueue Operator on the cluster, as described in the Red Hat build of Kueue documentation.
Activates the Kueue integration by setting the managementState to Unmanaged in the DataScienceCluster custom resource, as described in Configuring workload management with Kueue.
Configures quotas to optimize resource allocation for user workloads, as described in the Red Hat build of Kueue documentation.
Enables Kueue in the dashboard by setting disableKueue to false in the OdhDashboardConfig custom resource, as described in Enabling Kueue in the dashboard.

Note
When Kueue is enabled in the dashboard, OpenShift AI automatically enables Kueue management for all new projects created from the dashboard. For existing projects, or for projects created by using the OpenShift CLI (oc), you must enable Kueue management manually by applying the kueue.openshift.io/managed=true label to the project namespace.

OpenShift AI administrator

Prepares the OpenShift AI environment:

Creates Kueue-enabled hardware profiles so that users can submit workloads from the OpenShift AI dashboard, as described in Working with hardware profiles.
ML Engineer or data scientist

Submits workloads to the queuing system:

For workloads created from the OpenShift AI dashboard, such as workbenches and model servers, selects a Kueue-enabled hardware profile during creation.
For workloads created by using a command-line interface or an SDK, such as distributed training jobs, adds the kueue.x-k8s.io/queue-name label to the workload’s YAML manifest and sets its value to the target LocalQueue name.
8.2. Configuring workload management with Kueue 

To use workload queuing in OpenShift AI, install the Red Hat build of Kueue Operator and activate the Kueue integration in OpenShift AI.

Prerequisites

You have cluster administrator privileges for your OpenShift cluster.
You are using OpenShift 4.19 or later.
You have installed and configured the cert-manager Operator for Red Hat OpenShift for your cluster.
You have installed the OpenShift CLI (oc) as described in the appropriate documentation for your cluster:

Installing the OpenShift CLI for OpenShift Container Platform
Installing the OpenShift CLI for Red Hat OpenShift Service on AWS
Procedure

In a terminal window, log in to the OpenShift CLI (oc) as shown in the following example:

$ oc login <openshift_cluster_url> -u <admin_username> -p <password>


Install the Red Hat build of Kueue Operator on your OpenShift cluster as described in the Red Hat build of Kueue documentation.
Activate the Kueue integration. You can use the predefined names for the default cluster queue and default local queue, or specify custom names.

To use the predefined queue names (default), run the following command. Replace <operator-namespace> with your operator namespace. The default operator namespace is redhat-ods-operator.

$ oc patch datasciencecluster default-dsc --type='merge' -p '{"spec":{"components":{"kueue":{"managementState":"Unmanaged"}}}}' -n <operator-namespace>


To specify custom queue names, run the following command. Replace <example-cluster-queue> and <example-local-queue> with your custom queue names, and replace <operator-namespace> with your operator namespace. The default operator namespace is redhat-ods-operator.

$ oc patch datasciencecluster default-dsc --type='merge' -p '{"spec":{"components":{"kueue":{"managementState":"Unmanaged","defaultClusterQueueName":"<example-cluster-queue>","defaultLocalQueueName":"<example-local-queue>"}}}}' -n <operator-namespace>


Verification

Verify that the Red Hat build of Kueue pods are running:

$ oc get pods -n openshift-kueue-operator


You should see output similar to the following example:

kueue-controller-manager-d9fc745df-ph77w    1/1     Running
openshift-kueue-operator-69cfbf45cf-lwtpm   1/1     Running


Verify that the default ClusterQueue was created:

$ oc get clusterqueues


Next steps

Configure quotas by creating and modifying ResourceFlavor, ClusterQueue, and LocalQueue objects. For details, see the Red Hat build of Kueue documentation.
Enable Kueue in the dashboard so that users can select Kueue-enabled options when creating workloads. When you enable Kueue, you also enable Kueue management for all new projects created from the dashboard. See Enabling Kueue in the dashboard.
Cluster administrators and OpenShift AI administrators can create hardware profiles so that users can submit workloads from the OpenShift AI dashboard. See Working with hardware profiles.
8.2.1. Enabling Kueue in the dashboard 

Enable Kueue in the OpenShift AI dashboard so that users can select Kueue-enabled options when creating workloads.

When you enable Kueue in the dashboard, OpenShift AI automatically enables Kueue management for all new projects created from the dashboard. For these projects, OpenShift AI applies the kueue.openshift.io/managed=true label to the namespace and creates a LocalQueue object if one does not already exist. The LocalQueue object is created with the opendatahub.io/managed=false annotation, so it is not managed after creation. Cluster administrators can modify or delete it as needed. A validating webhook then enforces that any new or updated workload resource in a Kueue-enabled project includes the kueue.x-k8s.io/queue-name label.

Note
For existing projects, or for projects created by using the OpenShift CLI (oc), you must enable Kueue management manually by applying the kueue.openshift.io/managed=true label to the project namespace.

$ oc label namespace <project-namespace> kueue.openshift.io/managed=true --overwrite


Prerequisites

You have cluster administrator privileges for your OpenShift cluster.
You are using OpenShift 4.19 or later.
You have installed and activated the Red Hat build of Kueue Operator, as described in Configuring workload management with Kueue.
You have configured quotas, as described in the Red Hat build of Kueue documentation.
Procedure

In a terminal window, log in to the OpenShift CLI (oc) as shown in the following example:

$ oc login <openshift_cluster_url> -u <admin_username> -p <password>


Update the odh-dashboard-config custom resource in the OpenShift AI applications namespace. Replace <applications-namespace> with your OpenShift AI applications namespace. The default is redhat-ods-applications.

$ oc patch odhdashboardconfig odh-dashboard-config \
  -n \<applications-namespace\> \
  --type merge \
  -p {"spec":{"dashboardConfig":{"disableKueue":false}}}


Verification

From the OpenShift AI dashboard, create a new project.
Verify that the project namespace is labeled for Kueue management:

$ oc get ns <project-namespace> -o jsonpath='{.metadata.labels.kueue\.openshift\.io/managed}{"\n"}'


The output should be true.

Confirm that a default LocalQueue exists for the project namespace:

$ oc get localqueues -n <project-namespace>


Create a test workload (for example, a Notebook) and verify that it includes the kueue.x-k8s.io/queue-name label.
Next step

Cluster administrators and OpenShift AI administrators can create hardware profiles so that users can submit workloads from the OpenShift AI dashboard. See Working with hardware profiles.
8.3. Troubleshooting common problems with Kueue 

If your users are experiencing errors in Red Hat OpenShift AI relating to Kueue workloads, read this section to understand what could be causing the problem, and how to resolve the problem.

If the problem is not documented here or in the release notes, contact Red Hat Support.

8.3.1. A user receives a "failed to call webhook" error message for Kueue 

Problem

After the user runs the cluster.apply() command, the following error is shown:

ApiException: (500)
Reason: Internal Server Error
HTTP response body: {"kind":"Status","apiVersion":"v1","metadata":{},"status":"Failure","message":"Internal error occurred: failed calling webhook \"mraycluster.kb.io\": failed to call webhook: Post \"https://kueue-webhook-service.redhat-ods-applications.svc:443/mutate-ray-io-v1-raycluster?timeout=10s\": no endpoints available for service \"kueue-webhook-service\"","reason":"InternalError","details":{"causes":[{"message":"failed calling webhook \"mraycluster.kb.io\": failed to call webhook: Post \"https://kueue-webhook-service.redhat-ods-applications.svc:443/mutate-ray-io-v1-raycluster?timeout=10s\": no endpoints available for service \"kueue-webhook-service\""}]},"code":500}


Diagnosis

The Kueue pod might not be running.

Resolution

In the OpenShift console, select the user’s project from the Project list.
Click Workloads → Pods.
Verify that the Kueue pod is running. If necessary, restart the Kueue pod.
Review the logs for the Kueue pod to verify that the webhook server is serving, as shown in the following example:

{"level":"info","ts":"2024-06-24T14:36:24.255137871Z","logger":"controller-runtime.webhook","caller":"webhook/server.go:242","msg":"Serving webhook server","host":"","port":9443}


8.3.2. A user receives a "Default Local Queue …​ not found" error message 

Problem

After the user runs the cluster.apply() command, the following error is shown:

Default Local Queue with kueue.x-k8s.io/default-queue: true annotation not found please create a default Local Queue or provide the local_queue name in Cluster Configuration.


Diagnosis

No default local queue is defined, and a local queue is not specified in the cluster configuration.

Resolution

Check whether a local queue exists in the user’s project, as follows:

In the OpenShift console, select the user’s project from the Project list.
Click Home → Search, and from the Resources list, select LocalQueue.
If no local queues are found, create a local queue.
Provide the user with the details of the local queues in their project, and advise them to add a local queue to their cluster configuration.
Define a default local queue.

For information about creating a local queue and defining a default local queue, see Configuring quota management for distributed workloads.

8.3.3. A user receives a "local_queue provided does not exist" error message 

Problem

After the user runs the cluster.apply() command, the following error is shown:

local_queue provided does not exist or is not in this namespace. Please provide the correct local_queue name in Cluster Configuration.


Diagnosis

An incorrect value is specified for the local queue in the cluster configuration, or an incorrect default local queue is defined. The specified local queue either does not exist, or exists in a different namespace.

Resolution

In the OpenShift console, select the user’s project from the Project list.

Click Search, and from the Resources list, select LocalQueue.
Resolve the problem in one of the following ways:

If no local queues are found, create a local queue.
If one or more local queues are found, provide the user with the details of the local queues in their project. Advise the user to ensure that they spelled the local queue name correctly in their cluster configuration, and that the namespace value in the cluster configuration matches their project name.
Define a default local queue.

For information about creating a local queue and defining a default local queue, see Configuring quota management for distributed workloads.

8.3.4. The pod provisioned by Kueue is terminated before the image is pulled 

Problem

Kueue waits for a period of time before marking a workload as ready for all of the workload pods to become provisioned and running. By default, Kueue waits for 5 minutes. If the pod image is very large and is still being pulled after the 5-minute waiting period elapses, Kueue fails the workload and terminates the related pods.

Diagnosis

In the OpenShift console, select the user’s project from the Project list.
Click Workloads → Pods.
Click the user’s pod name to open the pod details page.
Click the Events tab, and review the pod events to check whether the image pull completed successfully.
Resolution

If the pod takes more than 5 minutes to pull the image, resolve the problem in one of the following ways:

Add an OnFailure restart policy for resources that are managed by Kueue.
Configure a custom timeout for the waitForPodsReady property in the Kueue custom resource (CR). The CR is installed in the openshift-kueue-operator namespace by the Red Hat build of Kueue Operator.
For more information about this configuration option, see Enabling waitForPodsReady in the Kueue documentation.

8.3.5. Additional resources 

Troubleshooting common problems with distributed workloads for administrators
Troubleshooting common problems with distributed workloads for users
8.4. Migrating to the Red Hat build of Kueue Operator 

Starting with OpenShift AI 2.24, the embedded Kueue component for managing distributed workloads is deprecated.

OpenShift AI now uses the Red Hat build of Kueue Operator to provide enhanced workload scheduling for distributed training, workbench, and model serving workloads.

Check if your environment is using the embedded Kueue component by verifying the spec.components.kueue.managementState field in the DataScienceCluster custom resource. If the field is set to Managed, you must migrate to the Red Hat build of Kueue Operator before upgrading OpenShift AI to avoid controller conflicts and ensure continued support for queue-based workloads.

OpenShift AI does not automatically migrate workloads, and you cannot install both the embedded Kueue and the Red Hat build of Kueue Operator on the same cluster.

Prerequisites

Your environment is currently using the embedded Kueue component. That is, the spec.components.kueue.managementState field in the DataScienceCluster custom resource is set to Managed.

Note
If spec.components.kueue.managementState is set to Removed or Unmanaged, skip this migration.

You have cluster administrator privileges for your OpenShift cluster.
You are using OpenShift 4.19 or later.
You have installed and configured the cert-manager Operator for Red Hat OpenShift for your cluster.
Procedure

Optional: When you migrate from the embedded Kueue to Red Hat build of Kueue, the OpenShift AI Operator automatically moves your existing Kueue configuration from the kueue-manager-config ConfigMap to the Kueue custom resource (CR).

If you want to keep the kueue-manager-config ConfigMap for reference, run the following command. Replace <applications-namespace> with your OpenShift AI applications namespace. The default namespace is redhat-ods-applications.

$ oc annotate configmap kueue-manager-config -n <applications-namespace> opendatahub.io/managed=false


Log in to the OpenShift web console as a cluster administrator.
Uninstall the embedded Kueue component to avoid potential configuration conflicts.

Note
If you need to keep workloads running without interruption, you can skip this step. However, skipping it is not recommended because it might cause temporary configuration issues during the OpenShift AI upgrade.

In the web console, click Ecosystem → Installed Operators and then click the Red Hat OpenShift AI Operator.
Click the Data Science Cluster tab.
Click the default-dsc object.
Click the YAML tab.
Set spec.components.kueue.managementState to Removed as shown:

spec:
  components:
    kueue:
      managementState: Removed


Click Save.
Wait for the OpenShift AI Operator to reconcile, and then verify that the embedded Kueue was removed:

On the Details tab of the default-dsc object, check that the KueueReady condition has a Status of False and a Reason of Removed.
Go to Workloads → Deployments, select the project where OpenShift AI is installed (for example, redhat-ods-applications), and confirm that Kueue-related deployments (for example, kueue-controller-manager) are no longer present.
Install the Red Hat build of Kueue Operator on your OpenShift cluster:

Follow the steps to install the Red Hat build of Kueue Operator, as described in the Red Hat build of Kueue documentation.
Go to Ecosystem → Installed Operators and confirm that the Red Hat build of Kueue Operator is listed with Status as Succeeded.
Activate the Red Hat build of Kueue Operator in OpenShift AI:

In the web console, click Ecosystem → Installed Operators and then click the Red Hat OpenShift AI Operator.
Click the Data Science Cluster tab.
Click the default-dsc object.
Click the YAML tab.
Set spec.components.kueue.managementState to Unmanaged. You can either use the predefined names (default) for the default cluster queue and default local queue, or specify custom names, as shown in the following examples.

To use the predefined queue names, apply the following configuration:

spec:
  components:
    kueue:
      managementState: Unmanaged


To specify custom queue names, apply the following configuration, replacing <example-cluster-queue> and <example-local-queue> with your custom values:

spec:
  components:
    kueue:
      managementState: Unmanaged
      defaultClusterQueueName: <example-cluster-queue>
      defaultLocalQueueName: <example-local-queue>



Show less
Click Save.
Enable Kueue management for existing projects by applying the kueue.openshift.io/managed=true label to each project namespace:

$ oc label namespace <project-namespace> kueue.openshift.io/managed=true --overwrite


Replace <project-namespace> with the name of your project.

Note
Kueue validation and queue enforcement apply only to workloads in namespaces labeled with kueue.openshift.io/managed=true.

Verification

Verify that the embedded Kueue component was removed.
Verify that the DataScienceCluster resource shows a healthy Unmanaged status for Kueue.
Verify that existing workloads in the queue continue to be processed by the Red Hat build of Kueue controllers. Submit a new test workload to confirm functionality.
Next steps

Configure quotas by creating and modifying ResourceFlavor, ClusterQueue, and LocalQueue objects. For details, see the Red Hat build of Kueue documentation.
Enable Kueue in the dashboard so that users can select Kueue-enabled options when creating workloads. When enabled, Kueue management is automatically applied to all new projects created from the dashboard. See Enabling Kueue in the dashboard.
Cluster administrators and OpenShift AI administrators can create hardware profiles so that users can submit workloads from the OpenShift AI dashboard. See Working with hardware profiles.
Chapter 9. Managing distributed workloads 

In OpenShift AI, distributed workloads like PyTorchJob, RayJob, and RayCluster are created and managed by their respective workload operators. Kueue provides queueing and admission control and integrates with these operators to decide when workloads can run based on cluster-wide quotas.

You can perform advanced configuration for your distributed workloads environment, such as configuring quota management or setting up a cluster for RDMA.

9.1. Configuring quota management for distributed workloads 

Configure quotas for distributed workloads by creating Kueue resources. Quotas ensure that you can share resources between several projects.

Prerequisites

You have logged in to OpenShift with the cluster-admin role.
You have installed the OpenShift CLI (oc) as described in the appropriate documentation for your cluster:

Installing the OpenShift CLI for OpenShift Container Platform
Installing the OpenShift CLI for Red Hat OpenShift Service on AWS
You have installed and activated the Red Hat build of Kueue Operator as described in Configuring workload management with Kueue.
You have installed the required distributed workloads components as described in Installing the distributed workloads components (for disconnected environments, see Installing the distributed workloads components).
You have created a project that contains a workbench, and the workbench is running a default workbench image that contains the CodeFlare SDK, for example, the Standard Data Science workbench. For information about how to create a project, see Creating a project.
You have sufficient resources. In addition to the base OpenShift AI resources, you need 1.6 vCPU and 2 GiB memory to deploy the distributed workloads infrastructure.
The resources are physically available in the cluster. For more information about Kueue resources, see the Red Hat build of Kueue documentation.
If you want to use graphics processing units (GPUs), you have enabled GPU support in OpenShift AI. If you use NVIDIA GPUs, see Enabling NVIDIA GPUs. If you use AMD GPUs, see AMD GPU integration.

Note
In OpenShift AI 3.4, Red Hat supports only NVIDIA GPU accelerators and AMD GPU accelerators for distributed workloads.

Procedure

In a terminal window, if you are not already logged in to your OpenShift cluster as a cluster administrator, log in to the OpenShift CLI (oc) as shown in the following example:

$ oc login <openshift_cluster_url> -u <admin_username> -p <password>


Verify that a resource flavor exists or create a custom one, as follows:

Check whether a ResourceFlavor already exists:

$ oc get resourceflavors


If a ResourceFlavor already exists and you need to modify it, edit it in place:

$ oc edit resourceflavor <existing_resourceflavor_name>


If a ResourceFlavor does not exist or you want a custom one, create a file called default_flavor.yaml and populate it with the following content:

Empty Kueue resource flavor


apiVersion: kueue.x-k8s.io/v1beta1
kind: ResourceFlavor
metadata:
  name: <example_resource_flavor>


For more examples, see Example Kueue resource configurations.

Perform one of the following actions:

If you are modifying the existing resource flavor, save the changes.
If you are creating a new resource flavor, apply the configuration to create the ResourceFlavor object:

$ oc apply -f default_flavor.yaml


Verify that a default cluster queue exists or create a custom one, as follows:

Note
OpenShift AI automatically created a default cluster queue when the Kueue integration was activated. You can verify and modify the default cluster queue, or create a custom one.

Check whether a ClusterQueue already exists:

$ oc get clusterqueues


If a ClusterQueue already exists and you need to modify it (for example, to change the resources), edit it in place:

$ oc edit clusterqueue <existing_clusterqueue_name>


If a ClusterQueue does not exist or you want a custom one, create a file called cluster_queue.yaml and populate it with the following content:

Example cluster queue


apiVersion: kueue.x-k8s.io/v1beta1
kind: ClusterQueue
metadata:
  name: <example_cluster_queue>
spec:
  namespaceSelector: {}   1 
  resourceGroups:
  - coveredResources: ["cpu", "memory", "nvidia.com/gpu"]   2 
    flavors:
    - name: "<resource_flavor_name>"   3 
      resources:   4 
      - name: "cpu"
        nominalQuota: 9
      - name: "memory"
        nominalQuota: 36Gi
      - name: "nvidia.com/gpu"
        nominalQuota: 5



Show less
1
Defines which namespaces can use the resources governed by this cluster queue. An empty namespaceSelector as shown in the example means that all namespaces can use these resources.
2
Defines the resource types governed by the cluster queue. This example ClusterQueue object governs CPU, memory, and GPU resources. If you use AMD GPUs, replace nvidia.com/gpu with amd.com/gpu in the example code.
3
Defines the resource flavor that is applied to the resource types listed. In this example, the <resource_flavor_name> resource flavor is applied to CPU, memory, and GPU resources.
4
Defines the resource requirements for admitting jobs. The cluster queue will start a distributed workload only if the total required resources are within these quota limits.
Replace the example quota values (9 CPUs, 36 GiB memory, and 5 NVIDIA GPUs) with the appropriate values for your cluster queue. If you use AMD GPUs, replace nvidia.com/gpu with amd.com/gpu in the example code. For more examples, see Example Kueue resource configurations.

You must specify a quota for each resource that the user can request, even if the requested value is 0, by updating the spec.resourceGroups section as follows:

Include the resource name in the coveredResources list.
Specify the resource name and nominalQuota in the flavors.resources section, even if the nominalQuota value is 0.
Perform one of the following actions:

If you are modifying the existing cluster queue, save the changes.
If you are creating a new cluster queue, apply the configuration to create the ClusterQueue object:

$ oc apply -f cluster_queue.yaml


Verify that a local queue that points to your cluster queue exists for your project namespace, or create a custom one, as follows:

Note
If Kueue is enabled in the OpenShift AI dashboard, new projects created from the dashboard are automatically configured for Kueue management. In those namespaces, a default local queue might already exist. You can verify and modify the local queue, or create a custom one.

Check whether a LocalQueue already exists for your project namespace:

$ oc get localqueues -n <project_namespace>


If a LocalQueue already exists and you need to modify it (for example, to point to a different ClusterQueue), edit it in place:

$ oc edit localqueue <existing_localqueue_name> -n <project_namespace>


If a LocalQueue does not exist or you want a custom one, create a file called local_queue.yaml and populate it with the following content:

Example local queue


apiVersion: kueue.x-k8s.io/v1beta1
kind: LocalQueue
metadata:
  name: <example_local_queue>
  namespace: <project_namespace>
spec:
  clusterQueue: <cluster_queue_name>



Show less
Replace the name, namespace, and clusterQueue values accordingly.
Perform one of the following actions:

If you are modifying an existing local queue, save the changes.
If you are creating a new local queue, apply the configuration to create the LocalQueue object:

$ oc apply -f local_queue.yaml


Verification

Check the status of the local queue in a project, as follows:

$ oc get localqueues -n <project_namespace>


Additional resources

Red Hat build of Kueue documentation
Kueue documentation
9.2. Example Kueue resource configurations for distributed workloads 

You can use these example configurations as a starting point for creating Kueue resources to manage your distributed training workloads.

These examples show how to configure Kueue resource flavors and cluster queues for common distributed training scenarios.

Note
In OpenShift AI 3.4, Red Hat does not support shared cohorts.

9.2.1. NVIDIA GPUs without shared cohort 

9.2.1.1. NVIDIA RTX A400 GPU resource flavor 

apiVersion: kueue.x-k8s.io/v1beta1
kind: ResourceFlavor
metadata:
  name: "a400node"
spec:
  nodeLabels:
    instance-type: nvidia-a400-node
  tolerations:
  - key: "HasGPU"
    operator: "Exists"
    effect: "NoSchedule"



Show less
9.2.1.2. NVIDIA RTX A1000 GPU resource flavor 

apiVersion: kueue.x-k8s.io/v1beta1
kind: ResourceFlavor
metadata:
  name: "a1000node"
spec:
  nodeLabels:
    instance-type: nvidia-a1000-node
  tolerations:
  - key: "HasGPU"
    operator: "Exists"
    effect: "NoSchedule"



Show less
9.2.1.3. NVIDIA RTX A400 GPU cluster queue 

apiVersion: kueue.x-k8s.io/v1beta1
kind: ClusterQueue
metadata:
  name: "a400queue"
spec:
  namespaceSelector: {} # match all.
  resourceGroups:
  - coveredResources: ["cpu", "memory", "nvidia.com/gpu"]
    flavors:
    - name: "a400node"
      resources:
      - name: "cpu"
        nominalQuota: 16
      - name: "memory"
        nominalQuota: 64Gi
      - name: "nvidia.com/gpu"
        nominalQuota: 2



Show less
9.2.1.4. NVIDIA RTX A1000 GPU cluster queue 

apiVersion: kueue.x-k8s.io/v1beta1
kind: ClusterQueue
metadata:
  name: "a1000queue"
spec:
  namespaceSelector: {} # match all.
  resourceGroups:
  - coveredResources: ["cpu", "memory", "nvidia.com/gpu"]
    flavors:
    - name: "a1000node"
      resources:
      - name: "cpu"
        nominalQuota: 16
      - name: "memory"
        nominalQuota: 64Gi
      - name: "nvidia.com/gpu"
        nominalQuota: 2



Show less
9.2.2. NVIDIA GPUs and AMD GPUs without shared cohort 

9.2.2.1. AMD GPU resource flavor 

apiVersion: kueue.x-k8s.io/v1beta1
kind: ResourceFlavor
metadata:
  name: "amd-node"
spec:
  nodeLabels:
    instance-type: amd-node
  tolerations:
  - key: "HasGPU"
    operator: "Exists"
    effect: "NoSchedule"



Show less
9.2.2.2. NVIDIA GPU resource flavor 

apiVersion: kueue.x-k8s.io/v1beta1
kind: ResourceFlavor
metadata:
  name: "nvidia-node"
spec:
  nodeLabels:
    instance-type: nvidia-node
  tolerations:
  - key: "HasGPU"
    operator: "Exists"
    effect: "NoSchedule"



Show less
9.2.2.3. AMD GPU cluster queue 

apiVersion: kueue.x-k8s.io/v1beta1
kind: ClusterQueue
metadata:
  name: "team-a-amd-queue"
spec:
  namespaceSelector: {} # match all.
  resourceGroups:
  - coveredResources: ["cpu", "memory", "amd.com/gpu"]
    flavors:
    - name: "amd-node"
      resources:
      - name: "cpu"
        nominalQuota: 16
      - name: "memory"
        nominalQuota: 64Gi
      - name: "amd.com/gpu"
        nominalQuota: 2



Show less
9.2.2.4. NVIDIA GPU cluster queue 

apiVersion: kueue.x-k8s.io/v1beta1
kind: ClusterQueue
metadata:
  name: "team-a-nvidia-queue"
spec:
  namespaceSelector: {} # match all.
  resourceGroups:
  - coveredResources: ["cpu", "memory", "nvidia.com/gpu"]
    flavors:
    - name: "nvidia-node"
      resources:
      - name: "cpu"
        nominalQuota: 16
      - name: "memory"
        nominalQuota: 64Gi
      - name: "nvidia.com/gpu"
        nominalQuota: 2



Show less
Additional resources

Red Hat build of Kueue documentation
Resource Flavor in the Kueue documentation
Cluster Queue in the Kueue documentation
9.3. Configuring a cluster for RDMA 

NVIDIA GPUDirect RDMA uses Remote Direct Memory Access (RDMA) to provide direct GPU interconnect. To configure a cluster for RDMA, a cluster administrator must install and configure several Operators.

Prerequisites

You can access an OpenShift cluster as a cluster administrator.
Your cluster has multiple worker nodes with supported NVIDIA GPUs, and can access a compatible NVIDIA accelerated networking platform.
You have installed Red Hat OpenShift AI with the required distributed training components as described in Installing the distributed workloads components (for disconnected environments, see Installing the distributed workloads components).
You have configured the distributed training resources as described in Managing distributed workloads.
Procedure

Log in to the OpenShift Console as a cluster administrator.
Enable NVIDIA GPU support in OpenShift AI.

This process includes installing the Node Feature Discovery Operator and the NVIDIA GPU Operator. For more information, see Enabling NVIDIA GPUs.

Note
After the NVIDIA GPU Operator is installed, ensure that rdma is set to enabled in your ClusterPolicy custom resource instance.

To simplify the management of NVIDIA networking resources, install and configure the NVIDIA Network Operator, as follows:

Install the NVIDIA Network Operator, as described in Adding Operators to a cluster in the OpenShift documentation.
Configure the NVIDIA Network Operator, as described in the deployment examples in the Network Operator Application Notes in the NVIDIA documentation.
[Optional] To use Single Root I/O Virtualization (SR-IOV) deployment modes, complete the following steps:

Install the SR-IOV Network Operator, as described in the Installing the SR-IOV Network Operator section in the OpenShift documentation.
Configure the SR-IOV Network Operator, as described in the Configuring the SR-IOV Network Operator section in the OpenShift documentation.
Use the Machine Configuration Operator to increase the limit of pinned memory for non-root users in the container engine (CRI-O) configuration, as follows:

In the OpenShift Console, in the Administrator perspective, click Compute → MachineConfigs.
Click Create MachineConfig.
Replace the placeholder text with the following content:

Example machine configuration


apiVersion: machineconfiguration.openshift.io/v1
kind: MachineConfig
metadata:
  labels:
    machineconfiguration.openshift.io/role: worker
  name: 02-worker-container-runtime
spec:
  config:
    ignition:
      version: 3.2.0
    storage:
      files:
        - contents:
            inline: |
              [crio.runtime]
              default_ulimits = [
                "memlock=-1:-1"
              ]
          mode: 420
          overwrite: true
          path: /etc/crio/crio.conf.d/10-custom



Show less
Edit the default_ulimits entry to specify an appropriate value for your configuration. For more information about default limits, see the Set default ulimits on CRIO Using machine config Knowledgebase solution.
Click Create.
Restart the worker nodes to apply the machine configuration.
This configuration enables non-root users to run the training job with RDMA in the most restrictive OpenShift default security context.

Verification

Verify that the Operators are installed correctly, as follows:

In the OpenShift Console, in the Administrator perspective, click Workloads → Pods.
Select your project from the Project list.
Verify that a pod is running for each of the newly installed Operators.
Verify that RDMA is being used, as follows:

Edit the PyTorchJob resource to set the *NCCL_DEBUG* environment variable to INFO, as shown in the following example:

Setting the NCCL debug level to INFO


        spec:
          containers:
          - command:
            - /bin/bash
            - -c
            - "your container command"
            env:
            - name: NCCL_SOCKET_IFNAME
              value: "net1"
            - name: NCCL_IB_HCA
              value: "mlx5_1"
            - name: NCCL_DEBUG
              value: "INFO"



Show less
Run the PyTorch job.
Check that the pod logs include an entry similar to the following text:

Example pod log entry


NCCL INFO NET/IB : Using [0]mlx5_1:1/RoCE [RO]


Additional resources

Machine configuration in the OpenShift documentation
Managing security context constraints in the OpenShift documentation
9.4. Troubleshooting common problems with distributed workloads for administrators 

If your users are experiencing errors in Red Hat OpenShift AI relating to distributed workloads, read this section to understand what could be causing the problem, and how to resolve the problem.

If the problem is not documented here or in the release notes, contact Red Hat Support.

9.4.1. A user’s Ray cluster is in a suspended state 

Problem

The resource quota specified in the cluster queue configuration might be insufficient, or the resource flavor might not yet be created.

Diagnosis

The user’s Ray cluster head pod or worker pods remain in a suspended state. Check the status of the Workload resource that is created with the RayCluster resource. The status.conditions.message field provides the reason for the suspended state, as shown in the following example:

status:
 conditions:
   - lastTransitionTime: '2024-05-29T13:05:09Z'
     message: 'couldn''t assign flavors to pod set small-group-jobtest12: insufficient quota for nvidia.com/gpu in flavor default-flavor in ClusterQueue'


Resolution

Check whether the resource flavor is created, as follows:

In the OpenShift console, select the user’s project from the Project list.
Click Home → Search, and from the Resources list, select ResourceFlavor.
If necessary, create the resource flavor.
Check the cluster queue configuration in the user’s code, to ensure that the resources that they requested are within the limits defined for the project.
If necessary, increase the resource quota.
For information about configuring resource flavors and quotas, see Configuring quota management for distributed workloads.

9.4.2. A user’s Ray cluster is in a failed state 

Problem

The user might have insufficient resources.

Diagnosis

The user’s Ray cluster head pod or worker pods are not running. When a Ray cluster is created, it initially enters a failed state. This failed state usually resolves after the reconciliation process completes and the Ray cluster pods are running.

Resolution

If the failed state persists, complete the following steps:

In the OpenShift console, select the user’s project from the Project list.
Click Workloads → Pods.
Click the user’s pod name to open the pod details page.
Click the Events tab, and review the pod events to identify the cause of the problem.
Check the status of the Workload resource that is created with the RayCluster resource. The status.conditions.message field provides the reason for the failed state.
9.4.3. A user’s Ray cluster does not start 

Problem

After the user runs the cluster.apply() command, when they run either the cluster.details() command or the cluster.status() command, the Ray cluster status remains as Starting instead of changing to Ready. No pods are created.

Diagnosis

Check the status of the Workload resource that is created with the RayCluster resource. The status.conditions.message field provides the reason for remaining in the Starting state. Similarly, check the status.conditions.message field for the RayCluster resource.

Resolution

In the OpenShift console, select the user’s project from the Project list.
Click Workloads → Pods.
Verify that the KubeRay pod is running. If necessary, restart the KubeRay pod.
Review the logs for the KubeRay pod to identify errors.
9.4.4. A user cannot create a Ray cluster or submit jobs 

Problem

After the user runs the cluster.apply() command, an error similar to the following text is shown:

RuntimeError: Failed to get RayCluster CustomResourceDefinition: (403)
Reason: Forbidden
HTTP response body: {"kind":"Status","apiVersion":"v1","metadata":{},"status":"Failure","message":"rayclusters.ray.io is forbidden: User \"system:serviceaccount:regularuser-project:regularuser-workbench\" cannot list resource \"rayclusters\" in API group \"ray.io\" in the namespace \"regularuser-project\"","reason":"Forbidden","details":{"group":"ray.io","kind":"rayclusters"},"code":403}


Diagnosis

The correct OpenShift login credentials are not specified in the TokenAuthentication section of the user’s notebook code.

Resolution

Advise the user to identify and specify the correct OpenShift login credentials as follows:

In the OpenShift console header, click your username and click Copy login command.
In the new tab that opens, log in as the user whose credentials you want to use.
Click Display Token.
From the Log in with this token section, copy the token and server values.
Specify the copied token and server values in your notebook code as follows:

auth = TokenAuthentication(
    token = "<token>",
    server = "<server>",
    skip_tls=False
)
auth.login()



Show less
Verify that the user has the correct permissions and is part of the rhods-users group.