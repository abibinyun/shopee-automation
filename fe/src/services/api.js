import axiosInstance from "./axios";
import API from "./const";

// ########################
// Software API
// ########################

export const getAllSoftware = (setData, setLoading, setError) => {
  setLoading(true);

  axiosInstance
    .get(API.SOFTWARE.GET.ALL)
    .then((response) => {
      setData(response.data);
      setLoading(false);
    })
    .catch((error) => {
      setError(error.message);
      setLoading(false);
    });
};

export const addSoftware = async (data, setData, setLoading, setError) => {
  setLoading(true);

  try {
    const response = await axiosInstance.post(API.SOFTWARE.POST.ALL, data);
    const addSoftware = response.data.software;

    setData((prevData) => [...prevData, response.data.software]);
    setLoading(false);

    return { status: response.status, message: response.data.message, data: addSoftware };
  } catch (error) {
    setError(error.message);
    setLoading(false);
    return { status: "error", message: error.message };
  }
};

export const updateSoftware = async (data, setData, setLoading, setError) => {
  setLoading(true);

  try {
    const response = await axiosInstance.put(API.SOFTWARE.PUT.BY_ID.replace(":id", data.id), data);
    const updatedSoftware = response.data.software;

    setData((prevData) => prevData.map((software) => (software.id === updatedSoftware.id ? updatedSoftware : software)));
    setLoading(false);

    return { status: response.status, message: response.data.message, data: updatedSoftware };
  } catch (error) {
    setError(error.message);
    setLoading(false);
    return { status: "error", message: error.message };
  }
};

export const deleteSoftware = (id, setData, setLoading, setError) => {
  setLoading(true);

  axiosInstance
    .delete(API.SOFTWARE.DELETE.BY_ID.replace(":id", id))
    .then((response) => {
      setData((prevData) => prevData.filter((software) => software.id !== id));
      setLoading(false);
    })
    .catch((error) => {
      setError(error.message);
      setLoading(false);
    });
};

// ########################
// Software Version API
// ########################

export const getAllSoftwareVersion = (setData, setLoading, setError) => {
  setLoading(true);

  axiosInstance
    .get(API.SOFTWARE_VERSION.GET.ALL)
    .then((response) => {
      setData(response.data);
      setLoading(false);
    })
    .catch((error) => {
      setError(error.message);
      setLoading(false);
    });
};

export const getSoftwareVersionById = async (software_version_id) => {
  try {
    const response = axiosInstance.get(API.SOFTWARE_VERSION.GET.BY_ID.replace(":id", software_version_id));
    return response;
  } catch (error) {
    console.log("Error: ", error);
    return "-";
  }
};

export const getSoftwareVersionByParamSoftwareId = async (software_id, setData, setLoading, setError) => {
  setLoading(true);

  axiosInstance
    .get(API.SOFTWARE_VERSION.GET.BY_SOFTWARE_ID.replace(":software_id", software_id))
    .then((response) => {
      setData(response.data);
      setLoading(false);

      return response;
    })
    .catch((error) => {
      setError(error.message);
      setLoading(false);
    });
};

export const addSoftwareVersion = async (data, setSoftwareVersions, setLoading, setError) => {
  setLoading(true);
  try {
    const response = await axiosInstance.post(API.SOFTWARE_VERSION.POST.ALL, data);
    setSoftwareVersions((prevVersions) => [...prevVersions, response.data.version]);
    setLoading(false);
    return { status: response.status, message: response.data.message };
  } catch (error) {
    setError(error.message);
    setLoading(false);
    return { status: "error", message: error.message };
  }
};

export const updateSoftwareVersion = async (data, setSoftwareVersions, setLoading, setError) => {
  setLoading(true);

  try {
    const response = await axiosInstance.put(API.SOFTWARE_VERSION.PUT.BY_ID.replace(":id", data.id), data);
    setSoftwareVersions((prevVersions) => prevVersions.map((version) => (version.id === data.id ? response.data.version : version)));
    setLoading(false);
    return { status: response.status, message: response.data.message };
  } catch (error) {
    setError(error.message);
    setLoading(false);
    return { status: "error", message: error.message };
  }
};

export const deleteSoftwareVersion = async (id, setSoftwareVersions, setLoading, setError) => {
  setLoading(true);
  try {
    const response = await axiosInstance.delete(API.SOFTWARE_VERSION.DELETE.BY_ID.replace(":id", id));
    setSoftwareVersions((prevVersions) => prevVersions.filter((version) => version.id !== id));
    setLoading(false);
    return { status: response.status, message: response.data.message };
  } catch (error) {
    setError(error.message);
    setLoading(false);
    return { status: "error", message: error.message };
  }
};

// ########################
// License API
// ########################

export const getAllLicenses = (setData, setLoading, setError) => {
  setLoading(true);

  axiosInstance
    .get(API.LICENSE.GET.ALL)
    .then((response) => {
      setData(response.data);
      setLoading(false);
    })
    .catch((error) => {
      setError(error.message);
      setLoading(false);
    });
};

export const getAllAvailableLicenses = (setData, setLoading, setError) => {
  setLoading(true);

  axiosInstance
    .get(API.LICENSE.GET.AVAILABLE_ALL)
    .then((response) => {
      setData(response.data);
      setLoading(false);
    })
    .catch((error) => {
      setError(error.message);
      setLoading(false);
    });
};

export const addLicenses = async (data, setLicenses, setLoading, setError) => {
  setLoading(true);
  try {
    const response = await axiosInstance.post(API.LICENSE.POST.ALL, data);
    console.log("post License: ", response);
    setLicenses((prevVersions) => [...prevVersions, response.data.license]);
    setLoading(false);
    return { status: response.status, message: response.data.message };
  } catch (error) {
    setError(error.message);
    setLoading(false);
    return { status: "error", message: error.message };
  }
};

export const addMultipleLicenses = async (data, setLicenses, setLoading, setError) => {
  setLoading(true);
  try {
    const response = await axiosInstance.post(API.LICENSE.POST.MULTIPLE, data);
    console.log("post License: ", response);
    setLicenses((prevVersions) => [...prevVersions, response.data.license]);
    setLoading(false);
    return { status: response.status, message: response.data.message };
  } catch (error) {
    setError(error.message);
    setLoading(false);
    return { status: "error", message: error.message };
  }
};

export const updateLicenses = async (data, setLicenses, setLoading, setError) => {
  setLoading(true);

  try {
    const response = await axiosInstance.put(API.LICENSE.PUT.BY_ID.replace(":id", data.id), data);
    setLicenses((prevLicenses) => prevLicenses.map((license) => (license.id === data.id ? response.data.license : license)));
    setLoading(false);
    return { status: response.status, message: response.data.message };
  } catch (error) {
    setError(error.message);
    setLoading(false);
    return { status: "error", message: error.message };
  }
};

export const updateLicensesMultiple = async (data, setLicenses, setLoading, setError) => {
  setLoading(true);
  try {
    const response = await axiosInstance.put(API.LICENSE.PUT.MULTIPLE, data);
    setLicenses(response.data.license);
    setLoading(false);
    return response;
  } catch (error) {
    setLoading(false);
    setError(error.response ? error.response.data.message : "Terjadi kesalahan");
    throw error;
  }
};

export const deleteMultipleLicenses = async (data, setLoading, setError) => {
  setLoading(true);
  try {
    const response = await axiosInstance.post(API.LICENSE.POST.MULTIPLE_DELETE, data);

    return { status: response.status, message: response.data.message };
  } catch (error) {
    setError(error.response?.data?.message || "Failed to delete licenses");
    return { status: error.response?.status || 500 };
  } finally {
    setLoading(false);
  }
};

// ########################
// Order API
// ########################

export const getAllOrders = async () => {
  try {
    const response = await axiosInstance.get(API.ORDER.GET.ALL);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Gagal mengambil data");
  }
};

export const deleteOrder = async (id) => {
  try {
    const response = await axiosInstance.delete(API.ORDER.DELETE.BY_ID.replace(":id", id));
    return { status: response.status, message: response.data.message, id };
  } catch (error) {
    throw new Error(error.response?.data?.message || "Gagal menghapus pesanan");
  }
};
