import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Card,
  CardBody,
  Col,
  Container,
  CardHeader,
  Nav,
  NavItem,
  NavLink,
  Row,
  Modal,
  ModalHeader,
  Form,
  ModalBody,
  Label,
  Input,
  FormFeedback,
  Badge,
  InputGroup,
  InputGroupText,
  Table,
} from "reactstrap";
import { Link } from "react-router-dom";
import classnames from "classnames";
import Flatpickr from "react-flatpickr";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import TableContainer from "../../../Components/Common/TableContainer";
import DeleteModal from "../../../Components/Common/DeleteModal";
import Loader from "../../../Components/Common/Loader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as Yup from "yup";
import { useFormik } from "formik";
import moment from "moment";
import {
  fetchArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  fetchCategories,
  fetchFournisseurs,
} from "../../../Components/Article/ArticleServices";

import {
  Categorie,
  Fournisseur,
  Article,
} from "../../../Components/Article/Interfaces";

const ArticlesList = () => {
  const [modal, setModal] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [article, setArticle] = useState<Article | null>(null);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [isEdit, setIsEdit] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("1");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isExportCSV, setIsExportCSV] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [detailsModal, setDetailsModal] = useState(false);
  const [subcategories, setSubcategories] = useState<Categorie[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const API_BASE = process.env.REACT_APP_API_BASE;

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [articlesData, categoriesData, fournisseursData] =
        await Promise.all([
          fetchArticles(),
          fetchCategories(),
          fetchFournisseurs(),
        ]);

      const formattedArticles = articlesData.map((a: any) => ({
        ...a,
        type:
          a.type?.toLowerCase() === "consigné" ? "Consigné" : "Non Consigné",
        createdAt: a.createdAt || new Date().toISOString(),
        // Ensure we have default values for new fields
        taux_fodec: Boolean(a.taux_fodec),
        tva: a.tva ? a.tva.toString() : "0",
        pua_ht: Number(a.pua_ht) || 0,
        puv_ht: Number(a.puv_ht) || 0,
      }));

      setArticles(formattedArticles);
      setFilteredArticles(formattedArticles);
      setCategories(categoriesData);
      setFournisseurs(fournisseursData);
      setLoading(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Échec du chargement des données"
      );
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter articles by type, date and search text
  // In the useEffect that filters articles, update the search filter section:
  useEffect(() => {
    let result = [...articles];

    // Filter by type
    if (activeTab === "2") {
      result = result.filter((art) => art.type === "Consigné");
    } else if (activeTab === "3") {
      result = result.filter((art) => art.type === "Non Consigné");
    }

    // Filter by date range
    if (startDate && endDate) {
      const start = moment(startDate).startOf("day");
      const end = moment(endDate).endOf("day");

      result = result.filter((art) => {
        const artDate = moment(art.createdAt);
        return artDate.isBetween(start, end, null, "[]");
      });
    }

    // Filter by search text - FIXED VERSION
    if (searchText != null && searchText) {
      const searchLower = searchText.toLowerCase();
      result = result.filter((art) => {
        // Safe string conversion with null checks
        const safeToString = (value: any) => {
          if (value === null || value === undefined) return "";
          return String(value).toLowerCase();
        };

        return (
          safeToString(art.nom).includes(searchLower) ||
          safeToString(art.reference).includes(searchLower) ||
          safeToString(art.designation).includes(searchLower) ||
          safeToString(art.categorie?.nom).includes(searchLower) ||
          safeToString(art.fournisseur?.raison_sociale).includes(searchLower)
        );
      });
    }

    setFilteredArticles(result);
  }, [activeTab, startDate, endDate, searchText, articles]);

  // Delete article
  const handleDelete = async () => {
    if (!article) return;

    try {
      await deleteArticle(article.id);
      setDeleteModal(false);
      fetchData();
      toast.success("Article supprimé avec succès");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Échec de la suppression"
      );
    }
  };

  // Update the calculateTTC function signature
  const calculateTTC = (
    htValue: string | number,
    tvaRate: string | number,
    hasFodec: boolean
  ) => {
    const ht = parseFloat(htValue.toString()) || 0;
    const tva = parseFloat(tvaRate.toString()) || 0;
    const tvaAmount = ht * (tva / 100);
    const fodecAmount = hasFodec ? ht * 0.01 : 0;
    return (ht + tvaAmount + fodecAmount).toFixed(2);
  };

  // Save or update article - CORRECTED VERSION
  const handleSubmit = async (values: any) => {
    try {
      console.log("Starting handleSubmit with values:", values);

      // Calculate TTC values
      const puaTtc = calculateTTC(values.pua_ht, values.tva, values.taux_fodec);
      const puvTtc = calculateTTC(values.puv_ht, values.tva, values.taux_fodec);

      // Prepare article data with fallback for nom
      const articleData = {
        reference: values.reference,
        nom: values.nom || values.designation || values.reference, // Ensure nom has a value
        qte: Number(values.qte) || 0,
        designation: values.designation,
        categorie_id: Number(values.categorie_id),
        sous_categorie_id: values.sous_categorie_id
          ? Number(values.sous_categorie_id)
          : null,
        pua_ht: Number(values.pua_ht),
        puv_ht: Number(values.puv_ht),
        pua_ttc: Number(puaTtc),
        puv_ttc: Number(puvTtc),
        fournisseur_id: Number(values.fournisseur_id),
        type: values.type,
        taux_fodec: Boolean(values.taux_fodec),
        tva: Number(values.tva),
      };

      console.log("Sending article data:", articleData);

      if (isEdit && article) {
        await updateArticle(
          article.id,
          articleData,
          selectedImage || undefined
        );

        toast.success("Article mis à jour avec succès");
      } else {
        await createArticle(articleData, selectedImage || undefined);
        toast.success("Article ajouté avec succès");
      }

      setModal(false);
      setSelectedImage(null);
      setImagePreview(null);
      fetchData();
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      toast.error(err instanceof Error ? err.message : "Échec de l'opération");
    }
  };

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      reference: article?.reference || "",
      designation: article?.designation || "",
      // Ensure these are always strings, not null
      categorie_id: article?.sousCategorie
        ? String(article.sousCategorie.parent_id)
        : article?.categorie?.id
        ? String(article.categorie.id)
        : "",
      sous_categorie_id: article?.sousCategorie?.id
        ? String(article.sousCategorie.id)
        : "",
      pua_ht: article?.pua_ht || 0,
      puv_ht: article?.puv_ht || 0,
      pua_ttc: article?.pua_ttc || 0,
      puv_ttc: article?.puv_ttc || 0,
      fournisseur_id: article?.fournisseur?.id
        ? String(article.fournisseur.id)
        : "",
      type: article?.type || "Non Consigné",
      taux_fodec: article?.taux_fodec || false,
      tva: article?.tva ? String(article.tva) : "0",
      image: article?.image || "",
    },
    validationSchema: Yup.object({
      reference: Yup.string().required("La référence est obligatoire"),
      designation: Yup.string().required("La désignation est obligatoire"),
      categorie_id: Yup.string().required("La famille est obligatoire"), // Change to string
      pua_ht: Yup.number()
        .required("Le prix d'achat HT est obligatoire")
        .positive("Le prix doit être positif"),
      puv_ht: Yup.number()
        .required("Le prix de vente HT est obligatoire")
        .positive("Le prix doit être positif"),
      fournisseur_id: Yup.string().required("Le fournisseur est obligatoire"), // Change to string
      type: Yup.string().required("Le type est obligatoire"),
      tva: Yup.string(),
    }),
    onSubmit: handleSubmit,
  });

  // Add this effect to handle edit mode specifically
  useEffect(() => {
    if (isEdit && article && modal) {
      console.log("Editing article:", article);
      console.log("Article has sousCategorie:", article.sousCategorie);

      // Load subcategories for the main category
      const mainCategoryId = article.sousCategorie
        ? article.sousCategorie.parent_id
        : article.categorie?.id;
      if (mainCategoryId) {
        const subs = categories.filter(
          (cat) => cat.parent_id === mainCategoryId
        );
        console.log("Loaded subcategories:", subs);
        setSubcategories(subs);
      }
    }
  }, [isEdit, article, modal, categories]);

  // Update TTC values when HT, TVA or FODEC changes
  useEffect(() => {
    if (
      validation.values.pua_ht !== undefined &&
      validation.values.tva !== undefined
    ) {
      const puaTtc = calculateTTC(
        validation.values.pua_ht,
        validation.values.tva,
        validation.values.taux_fodec
      );
      const puvTtc = calculateTTC(
        validation.values.puv_ht,
        validation.values.tva,
        validation.values.taux_fodec
      );

      // Convert to numbers for comparison
      const currentPuaTtc = parseFloat(
        validation.values.pua_ttc?.toString() || "0"
      );
      const currentPuvTtc = parseFloat(
        validation.values.puv_ttc?.toString() || "0"
      );

      // Only update if values are different to avoid infinite loop
      if (
        parseFloat(puaTtc) !== currentPuaTtc ||
        parseFloat(puvTtc) !== currentPuvTtc
      ) {
        validation.setFieldValue("pua_ttc", puaTtc);
        validation.setFieldValue("puv_ttc", puvTtc);
      }
    }
  }, [
    validation.values.pua_ht,
    validation.values.puv_ht,
    validation.values.tva,
    validation.values.taux_fodec,
  ]);

  useEffect(() => {
    if (!modal) {
      setSelectedImage(null);
      setImagePreview(null);
    }
  }, [modal]);

  // Fixed columns - use the actual data from your API
  const columns = useMemo(
    () => [
      {
        header: "Référence",
        accessorKey: "reference",
        enableColumnFilter: false,
      },
      {
        header: "Désignation",
        accessorKey: "designation",
        enableColumnFilter: false,
      },
      {
        header: "Quantité",
        accessorKey: "qte",
        enableColumnFilter: false,
        cell: (cell: any) => cell.getValue() || 0,
      },
     
      {
        header: "Prix d'achat (TTC)",
        accessorKey: "pua_ttc",
        enableColumnFilter: false,
        cell: (cell: any) => {
          const value = cell.getValue();
          return <>{value != null ? Number(value).toFixed(2) : "0.00"} TND</>;
        },
      },
      {
        header: "Prix de vente (TTC)",
        accessorKey: "puv_ttc",
        enableColumnFilter: false,
        cell: (cell: any) => {
          const value = cell.getValue();
          return <>{value != null ? Number(value).toFixed(2) : "0.00"} TND</>;
        },
      },
      {
        header: "Type",
        accessorKey: "type",
        enableColumnFilter: false,
        cell: (cell: any) => (
          <Badge
            color={
              cell.getValue()?.toLowerCase() === "consigné"
                ? "success"
                : "primary"
            }
            className="text-uppercase"
          >
            {cell.getValue()}
          </Badge>
        ),
      },
      {
        header: "Action",
        cell: (cellProps: any) => {
          return (
            <ul className="list-inline hstack gap-2 mb-0">
              <li className="list-inline-item">
                <Link
                  to="#"
                  className="text-info d-inline-block"
                  onClick={() => {
                    setArticle(cellProps.row.original);
                    setDetailsModal(true);
                  }}
                >
                  <i className="ri-eye-fill fs-16"></i>
                </Link>
              </li>
              <li className="list-inline-item edit">
                <Link
                  to="#"
                  className="text-primary d-inline-block edit-item-btn"
                  onClick={() => {
                    setArticle(cellProps.row.original);
                    setIsEdit(true);
                    setModal(true);
                  }}
                >
                  <i className="ri-pencil-fill fs-16"></i>
                </Link>
              </li>
              <li className="list-inline-item">
                <Link
                  to="#"
                  className="text-danger d-inline-block remove-item-btn"
                  onClick={() => {
                    setArticle(cellProps.row.original);
                    setDeleteModal(true);
                  }}
                >
                  <i className="ri-delete-bin-5-fill fs-16"></i>
                </Link>
              </li>
            </ul>
          );
        },
      },
    ],
    []
  );
  const toggleModal = useCallback(() => {
    if (modal) {
      setModal(false);
      setArticle(null);
    } else {
      setModal(true);
    }
  }, [modal]);

  const toggleDetailsModal = useCallback(() => {
    setDetailsModal(!detailsModal);
  }, [detailsModal]);

  // In ArticlesList component - Fix the comparison issue
  useEffect(() => {
    if (validation.values.categorie_id) {
      const categoryId = parseInt(validation.values.categorie_id.toString());
      const subs = categories.filter((cat) => cat.parent_id === categoryId);
      setSubcategories(subs);

      // Reset subcategory if parent category changes
      const currentSubId = validation.values.sous_categorie_id
        ? parseInt(validation.values.sous_categorie_id.toString())
        : null;

      if (!subs.find((sub) => sub.id === currentSubId)) {
        validation.setFieldValue("sous_categorie_id", "");
      }
    } else {
      setSubcategories([]);
      validation.setFieldValue("sous_categorie_id", "");
    }
  }, [validation.values.categorie_id, categories]);

  return (
    <div className="page-content">
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDelete}
        onCloseClick={() => setDeleteModal(false)}
      />

      <Container fluid style={{ maxWidth: "100%" }}>
        <BreadCrumb title="Articles" pageTitle="Inventaire" />

        <Row>
          <Col lg={12}>
            <Card id="articleList">
              <CardHeader className="card-header border-0">
                <Row className="align-items-center gy-3">
                  <div className="col-sm">
                    <h5 className="card-title mb-0">Gestion des Articles</h5>
                  </div>
                  <div className="col-sm-auto">
                    <div className="text-success">
                      <span className="fw-semibold fs-16"> nombre des articles :
                        {filteredArticles.length} article
                        {filteredArticles.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <div className="col-sm-auto">
                    <div className="d-flex gap-1 flex-wrap">
                      <button
                        type="button"
                        className="btn btn-secondary add-btn"
                        onClick={() => {
                          setIsEdit(false);
                          setArticle(null);
                          toggleModal();
                        }}
                      >
                        <i className="ri-add-line align-bottom me-1"></i>{" "}
                        Ajouter Article
                      </button>
                      <button
                        type="button"
                        className="btn btn-success"
                        onClick={() => setIsExportCSV(true)}
                      >
                        <i className="ri-file-download-line align-bottom me-1"></i>{" "}
                        Exporter
                      </button>
                    </div>
                  </div>
                </Row>
              </CardHeader>

              <CardBody className="pt-0">
                <div>
                  <Nav
                    className="nav-tabs nav-tabs-custom nav-success"
                    role="tablist"
                  >
                    <NavItem>
                      <NavLink
                        className={classnames({ active: activeTab === "1" })}
                        onClick={() => {
                          setActiveTab("1");
                        }}
                        href="#"
                      >
                        <i className="ri-list-check-2 me-1 align-bottom"></i>{" "}
                        Tous
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames({ active: activeTab === "2" })}
                        onClick={() => {
                          setActiveTab("2");
                        }}
                        href="#"
                      >
                        <i className="ri-checkbox-circle-line me-1 align-bottom"></i>{" "}
                        Consigné
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames({ active: activeTab === "3" })}
                        onClick={() => {
                          setActiveTab("3");
                        }}
                        href="#"
                      >
                        <i className="ri-close-circle-line me-1 align-bottom"></i>{" "}
                        Non Consigné
                      </NavLink>
                    </NavItem>
                  </Nav>

                  <Row className="mt-3 mb-3">
                    <Col md={4}>
                      <div className="search-box">
                        <Input
                          type="text"
                          className="form-control"
                          placeholder="Rechercher..."
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                        />
                        <i className="ri-search-line search-icon"></i>
                      </div>
                    </Col>
                    <Col md={3}>
                      <InputGroup>
                        <InputGroupText>De</InputGroupText>
                        <Flatpickr
                          className="form-control"
                          options={{
                            dateFormat: "d M, Y",
                            altInput: true,
                            altFormat: "F j, Y",
                          }}
                          placeholder="Date de début"
                          onChange={(dates) => setStartDate(dates[0])}
                        />
                      </InputGroup>
                    </Col>
                    <Col md={3}>
                      <InputGroup>
                        <InputGroupText>À</InputGroupText>
                        <Flatpickr
                          className="form-control"
                          options={{
                            dateFormat: "d M, Y",
                            altInput: true,
                            altFormat: "F j, Y",
                          }}
                          placeholder="Date de fin"
                          onChange={(dates) => setEndDate(dates[0])}
                        />
                      </InputGroup>
                    </Col>
                    <Col md={2}>
                      <button
                        className="btn btn-light w-100"
                        onClick={() => {
                          setStartDate(null);
                          setEndDate(null);
                          setSearchText("");
                        }}
                      >
                        <i className="ri-close-line align-bottom me-1"></i>{" "}
                        Réinitialiser
                      </button>
                    </Col>
                  </Row>

                  {loading ? (
                    <Loader />
                  ) : error ? (
                    <div className="text-danger">{error}</div>
                  ) : (
                    <TableContainer
                      columns={columns}
                      data={filteredArticles}
                      isGlobalFilter={false}
                      customPageSize={100}
                      divClass="table-responsive table-card mb-1 mt-0"
                      tableClass="align-middle table-nowrap"
                      theadClass="table-light text-muted text-uppercase"
                    />
                  )}
                </div>

                {/* Details Modal */}
                <Modal
                  isOpen={detailsModal}
                  toggle={toggleDetailsModal}
                  centered
                  size="lg"
                >
                  <ModalHeader toggle={toggleDetailsModal}>
                    Détails de l'article - {article?.nom}
                  </ModalHeader>
                  <ModalBody>
                    {article && (
                      <Row>
                        <Col md={6}>
                          <div className="mb-3">
                            <Label className="form-label fw-semibold">
                              Nom
                            </Label>
                            <p>{article.nom}</p>
                          </div>
                        </Col>

                        <Col md={6}>
                          <div className="mb-3">
                            <Label className="form-label fw-semibold">
                              Référence
                            </Label>
                            <p>{article.reference}</p>
                          </div>
                        </Col>

                        <Col md={6}>
                          <div className="mb-3">
                            <Label className="form-label fw-semibold">
                              Désignation
                            </Label>
                            <p>{article.designation}</p>
                          </div>
                        </Col>

                        <Col md={6}>
                          <div className="mb-3">
                            <Label className="form-label fw-semibold">
                              Quantité
                            </Label>
                            <p>{article.qte}</p>
                          </div>
                        </Col>

                        <Col md={6}>
                          <div className="mb-3">
                            <Label className="form-label fw-semibold">
                              Famille
                            </Label>
                            <p>{article.categorie?.nom || "N/A"}</p>
                          </div>
                        </Col>

                        <Col md={6}>
                          <div className="mb-3">
                            <Label className="form-label fw-semibold">
                              Fournisseur
                            </Label>
                            <p>
                              {article.fournisseur?.raison_sociale || "N/A"}
                            </p>
                          </div>
                        </Col>

                        <Col md={6}>
                          <div className="mb-3">
                            <Label className="form-label fw-semibold">
                              Prix d'achat HT
                            </Label>
                            <p>
                              {article.pua_ht
                                ? Number(article.pua_ht).toFixed(2)
                                : "0.00"}{" "}
                              TND
                            </p>
                          </div>
                        </Col>

                        <Col md={6}>
                          <div className="mb-3">
                            <Label className="form-label fw-semibold">
                              Prix d'achat TTC
                            </Label>
                            <p>
                              {article.pua_ttc
                                ? Number(article.pua_ttc).toFixed(2)
                                : "0.00"}{" "}
                              TND
                            </p>
                          </div>
                        </Col>

                        <Col md={6}>
                          <div className="mb-3">
                            <Label className="form-label fw-semibold">
                              Prix de vente HT
                            </Label>
                            <p>
                              {article.puv_ht
                                ? Number(article.puv_ht).toFixed(2)
                                : "0.00"}{" "}
                              TND
                            </p>
                          </div>
                        </Col>

                        <Col md={6}>
                          <div className="mb-3">
                            <Label className="form-label fw-semibold">
                              Prix de vente TTC
                            </Label>
                            <p>
                              {article.puv_ttc
                                ? Number(article.puv_ttc).toFixed(2)
                                : "0.00"}{" "}
                              TND
                            </p>
                          </div>
                        </Col>

                        <Col md={6}>
                          <div className="mb-3">
                            <Label className="form-label fw-semibold">
                              TVA
                            </Label>
                            <p>{article.tva ? `${article.tva}%` : "N/A"}</p>
                          </div>
                        </Col>

                        <Col md={6}>
                          <div className="mb-3">
                            <Label className="form-label fw-semibold">
                              FODEC
                            </Label>
                            <p>
                              <Badge
                                color={
                                  article.taux_fodec ? "success" : "secondary"
                                }
                              >
                                {article.taux_fodec ? "Oui" : "Non"}
                              </Badge>
                            </p>
                          </div>
                        </Col>

                        <Col md={6}>
                          <div className="mb-3">
                            <Label className="form-label fw-semibold">
                              Type
                            </Label>
                            <p>
                              <Badge
                                color={
                                  article.type?.toLowerCase() === "consigné"
                                    ? "success"
                                    : "primary"
                                }
                                className="text-uppercase"
                              >
                                {article.type}
                              </Badge>
                            </p>
                          </div>
                        </Col>

                        <Col md={6}>
                          <div className="mb-3">
                            <Label className="form-label fw-semibold">
                              Date de création
                            </Label>
                            <p>
                              {moment(article.createdAt).format("DD MMM YYYY")}
                            </p>
                          </div>
                        </Col>
                      </Row>
                    )}
                  </ModalBody>
                </Modal>

                <Modal isOpen={modal} toggle={toggleModal} centered size="lg">
                  <ModalHeader toggle={toggleModal}>
                    {isEdit ? "Modifier Article" : "Ajouter Article"}
                  </ModalHeader>
                  <Form onSubmit={validation.handleSubmit}>
                    <ModalBody>
                      {/* Image Upload Section */}
                      <Row>
                        <Col md={12}>
                          <div className="mb-3">
                            <Label className="form-label">
                              Image de l'article
                            </Label>
                            <div className="border rounded p-3 text-center">
                              {imagePreview || article?.image ? (
                                <div className="mb-3">
                                  <img
                                    src={
                                      imagePreview ||
                                      (article?.image
                                        ? `${API_BASE}/${article.image.replace(
                                            /\\/g,
                                            "/"
                                          )}`
                                        : "")
                                    }
                                    alt="Preview"
                                    className="img-fluid rounded mb-2"
                                    style={{
                                      maxHeight: "150px",
                                      objectFit: "cover",
                                    }}
                                  />
                                  <div>
                                    <Label
                                      htmlFor="image-upload"
                                      className="btn btn-sm btn-outline-primary me-2 mb-1"
                                    >
                                      <i className="ri-upload-line align-middle me-1"></i>
                                      Changer l'image
                                    </Label>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-danger"
                                      onClick={() => {
                                        setImagePreview(null);
                                        setSelectedImage(null);
                                        validation.setFieldValue("image", "");
                                      }}
                                    >
                                      <i className="ri-delete-bin-line align-middle me-1"></i>
                                      Supprimer
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <i className="ri-image-line fs-1 text-muted mb-2 d-block"></i>
                                  <Label
                                    htmlFor="image-upload"
                                    className="btn btn-outline-primary"
                                  >
                                    <i className="ri-upload-line align-middle me-1"></i>
                                    Télécharger une image
                                  </Label>
                                </div>
                              )}
                              <Input
                                id="image-upload"
                                name="image"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="d-none"
                              />
                              <small className="text-muted d-block mt-2">
                                Formats supportés: JPG, PNG, GIF. Taille max:
                                5MB
                              </small>
                            </div>
                          </div>
                        </Col>
                      </Row>

                      {/* Basic Information */}
                      <Row>
                        <Col md={6}>
                          <div className="mb-3">
                            <Label className="form-label">Référence*</Label>

                            <Input
                              name="reference"
                              placeholder="Entrer la référence"
                              onChange={validation.handleChange}
                              onBlur={validation.handleBlur}
                              value={validation.values.reference}
                              invalid={
                                validation.touched.reference &&
                                !!validation.errors.reference
                              }
                            />

                            <FormFeedback>
                              {validation.errors.reference}
                            </FormFeedback>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="mb-3">
                            <Label className="form-label">Désignation*</Label>
                            <Input
                              name="designation"
                              placeholder="Entrer la désignation"
                              onChange={validation.handleChange}
                              onBlur={validation.handleBlur}
                              value={validation.values.designation}
                              invalid={
                                validation.touched.designation &&
                                !!validation.errors.designation
                              }
                            />
                            <FormFeedback>
                              {validation.errors.designation}
                            </FormFeedback>
                          </div>
                        </Col>
                      </Row>

                      {/* Categories */}
                      <Row>
                        <Col md={6}>
                          <div className="mb-3">
                            <Label className="form-label">
                              Famille Principale*
                            </Label>
                            <Input
                              name="categorie_id"
                              type="select"
                              onChange={validation.handleChange}
                              onBlur={validation.handleBlur}
                              value={validation.values.categorie_id}
                              invalid={
                                validation.touched.categorie_id &&
                                !!validation.errors.categorie_id
                              }
                            >
                              <option value="">
                                Sélectionner une famille principale
                              </option>
                              {categories
                                .filter((cat) => !cat.parent_id)
                                .map((categorie) => (
                                  <option
                                    key={categorie.id}
                                    value={categorie.id}
                                  >
                                    {categorie.nom}
                                  </option>
                                ))}
                            </Input>
                            <FormFeedback>
                              {validation.errors.categorie_id}
                            </FormFeedback>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="mb-3">
                            <Label className="form-label">Sous-Famille</Label>
                            <Input
                              name="sous_categorie_id"
                              type="select"
                              onChange={validation.handleChange}
                              onBlur={validation.handleBlur}
                              value={validation.values.sous_categorie_id}
                              disabled={!validation.values.categorie_id}
                            >
                              <option value="">
                                Sélectionner une sous-famille
                              </option>
                              {subcategories.map((subcategorie) => (
                                <option
                                  key={subcategorie.id}
                                  value={subcategorie.id}
                                >
                                  {subcategorie.nom}
                                </option>
                              ))}
                            </Input>
                            {!validation.values.categorie_id && (
                              <small className="text-muted">
                                Sélectionnez d'abord une famille principale
                              </small>
                            )}
                          </div>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <div className="mb-3">
                            <Label className="form-label">Fournisseur*</Label>
                            <Input
                              name="fournisseur_id"
                              type="select"
                              onChange={validation.handleChange}
                              onBlur={validation.handleBlur}
                              value={validation.values.fournisseur_id}
                              invalid={
                                validation.touched.fournisseur_id &&
                                !!validation.errors.fournisseur_id
                              }
                            >
                              <option value="">
                                Sélectionner un fournisseur
                              </option>
                              {fournisseurs.map((fournisseur) => (
                                <option
                                  key={fournisseur.id}
                                  value={fournisseur.id}
                                >
                                  {fournisseur.raison_sociale}
                                </option>
                              ))}
                            </Input>
                            <FormFeedback>
                              {validation.errors.fournisseur_id}
                            </FormFeedback>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="mb-3">
                            <Label className="form-label">Type*</Label>
                            <Input
                              name="type"
                              type="select"
                              onChange={validation.handleChange}
                              onBlur={validation.handleBlur}
                              value={validation.values.type}
                              invalid={
                                validation.touched.type &&
                                !!validation.errors.type
                              }
                            >
                              <option value="Non Consigné">Non Consigné</option>
                              <option value="Consigné">Consigné</option>
                            </Input>
                            <FormFeedback>
                              {validation.errors.type}
                            </FormFeedback>
                          </div>
                        </Col>
                      </Row>

                      {/* Pricing - HT */}
                      <Row>
                        <Col md={6}>
                          <div className="mb-3">
                            <Label className="form-label">
                              Prix d'achat (HT)*
                            </Label>
                            <Input
                              name="pua_ht"
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="Entrer le prix d'achat HT"
                              onChange={validation.handleChange}
                              onBlur={validation.handleBlur}
                              value={validation.values.pua_ht}
                              invalid={
                                validation.touched.pua_ht &&
                                !!validation.errors.pua_ht
                              }
                            />
                            <FormFeedback>
                              {validation.errors.pua_ht}
                            </FormFeedback>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="mb-3">
                            <Label className="form-label">
                              Prix de vente (HT)*
                            </Label>
                            <Input
                              name="puv_ht"
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="Entrer le prix de vente HT"
                              onChange={validation.handleChange}
                              onBlur={validation.handleBlur}
                              value={validation.values.puv_ht}
                              invalid={
                                validation.touched.puv_ht &&
                                !!validation.errors.puv_ht
                              }
                            />
                            <FormFeedback>
                              {validation.errors.puv_ht}
                            </FormFeedback>
                          </div>
                        </Col>
                      </Row>

                      {/* Pricing - TTC (Readonly) */}
                      <Row>
                        <Col md={6}>
                          <div className="mb-3">
                            <Label className="form-label">
                              Prix d'achat (TTC)
                            </Label>
                            <Input
                              name="pua_ttc"
                              type="number"
                              step="0.01"
                              placeholder="Calculé automatiquement"
                              value={validation.values.pua_ttc}
                              readOnly
                              className="bg-light"
                            />
                            <small className="text-muted">
                              Calculé: HT + TVA + FODEC
                            </small>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="mb-3">
                            <Label className="form-label">
                              Prix de vente (TTC)
                            </Label>
                            <Input
                              name="puv_ttc"
                              type="number"
                              step="0.01"
                              placeholder="Calculé automatiquement"
                              value={validation.values.puv_ttc}
                              readOnly
                              className="bg-light"
                            />
                            <small className="text-muted">
                              Calculé: HT + TVA + FODEC
                            </small>
                          </div>
                        </Col>
                      </Row>

                      {/* Tax Settings */}
                      <Row>
                        <Col md={6}>
                          <div className="mb-3">
                            <Label className="form-label">Taux de TVA</Label>
                            <Input
                              name="tva"
                              type="select"
                              onChange={validation.handleChange}
                              onBlur={validation.handleBlur}
                              value={validation.values.tva}
                            >
                              <option value="0">0%</option>
                              <option value="7">7%</option>
                              <option value="13">13%</option>
                              <option value="19">19%</option>
                            </Input>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div
                            className="mb-3 d-flex align-items-end"
                            style={{ height: "100%" }}
                          >
                            <div className="form-check form-switch">
                              <Input
                                name="taux_fodec"
                                type="checkbox"
                                className="form-check-input"
                                onChange={(e) => {
                                  validation.setFieldValue(
                                    "taux_fodec",
                                    e.target.checked
                                  );
                                }}
                                checked={!!validation.values.taux_fodec}
                                id="fodecSwitch"
                              />
                              <Label
                                className="form-check-label"
                                for="fodecSwitch"
                              >
                                Taux FODEC (1%)
                              </Label>
                            </div>
                          </div>
                        </Col>
                      </Row>

                      {/* Debug Section (remove in production) */}
                    </ModalBody>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-light"
                        onClick={toggleModal}
                      >
                        Fermer
                      </button>
                      <button type="submit" className="btn btn-success">
                        {isEdit ? "Mettre à jour" : "Ajouter"}
                      </button>
                    </div>
                  </Form>
                </Modal>
                <ToastContainer closeButton={false} limit={1} />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ArticlesList;
