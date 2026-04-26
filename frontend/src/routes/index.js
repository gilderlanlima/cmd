import React, { Suspense, lazy, useEffect, useState, useContext } from "react";
import { BrowserRouter, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import moment from "moment";

import LoggedInLayout from "../layout";
import { AuthProvider, AuthContext } from "../context/Auth/AuthContext";
import { TicketsContextProvider } from "../context/Tickets/TicketsContext";
import { WhatsAppsProvider } from "../context/WhatsApp/WhatsAppsContext";
import BackdropLoading from "../components/BackdropLoading";
import Route from "./Route";

const Dashboard = lazy(() => import("../pages/Dashboard"));
const TicketResponsiveContainer = lazy(() => import("../pages/TicketResponsiveContainer"));
const Signup = lazy(() => import("../pages/Signup"));
const Login = lazy(() => import("../pages/Login"));
const Connections = lazy(() => import("../pages/Connections"));
const Settings = lazy(() => import("../pages/Settings"));
const Financeiro = lazy(() => import("../pages/Financeiro"));
const Users = lazy(() => import("../pages/Users"));
const OnDuty = lazy(() => import("../pages/OnDuty"));
const Contacts = lazy(() => import("../pages/Contacts"));
const ContactImportPage = lazy(() => import("../pages/Contacts/import"));
const ChatMoments = lazy(() => import("../pages/Moments"));
const Queues = lazy(() => import("../pages/Queues"));
const Tags = lazy(() => import("../pages/Tags"));
const MessagesAPI = lazy(() => import("../pages/MessagesAPI"));
const Helps = lazy(() => import("../pages/Helps"));
const ContactLists = lazy(() => import("../pages/ContactLists"));
const ContactListItems = lazy(() => import("../pages/ContactListItems"));
const Companies = lazy(() => import("../pages/Companies"));
const Wallets = lazy(() => import("../pages/Wallets"));
const QuickMessages = lazy(() => import("../pages/QuickMessages"));
const Schedules = lazy(() => import("../pages/Schedules"));
const Campaigns = lazy(() => import("../pages/Campaigns"));
const Broadcasts = lazy(() => import("../pages/Broadcasts"));
const CampaignsConfig = lazy(() => import("../pages/CampaignsConfig"));
const CampaignReport = lazy(() => import("../pages/CampaignReport"));
const Annoucements = lazy(() => import("../pages/Annoucements"));
const Chat = lazy(() => import("../pages/Chat"));
const Prompts = lazy(() => import("../pages/Prompts"));
const AllConnections = lazy(() => import("../pages/AllConnections"));
const Reports = lazy(() => import("../pages/Reports"));
const RelatorioVendas = lazy(() => import("../pages/RelatorioVendas"));
const QueueIntegration = lazy(() => import("../pages/QueueIntegration"));
const Files = lazy(() => import("../pages/Files"));
const ToDoList = lazy(() => import("../pages/ToDoList"));
const Kanban = lazy(() => import("../pages/Kanban"));
const TagsKanban = lazy(() => import("../pages/TagsKanban"));
const BirthdaySettingsPage = lazy(() => import("../pages/BirthdaySettings"));
const CallHistoricals = lazy(() => import("../pages/CallHistoricals"));
const FlowBuilderConfig = lazy(() =>
  import("../pages/FlowBuilderConfig").then(module => ({
    default: module.FlowBuilderConfig
  }))
);
const FlowBuilder = lazy(() => import("../pages/FlowBuilder"));
const CampaignsPhrase = lazy(() => import("../pages/CampaignsPhrase"));
const Floup = lazy(() => import("../pages/Floup"));
const FloupDashboard = lazy(() => import("../pages/FloupDashboard"));

const RoutesContent = () => {
  const [showCampaigns, setShowCampaigns] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const cshow = localStorage.getItem("cshow");
    if (cshow !== undefined) {
      setShowCampaigns(true);
    }
  }, []);

  // Verificar se a empresa está vencida
  const isCompanyExpired = () => {
    if (!user || !user.company || user.company.id === 1) {
      return false; // Empresa ID 1 nunca expira
    }

    const dueDate = user.company.dueDate;
    if (!dueDate) return false;

    // Comparar apenas as datas (sem horas) para permitir acesso até 23h59 do dia do vencimento
    const hojeInicio = moment().startOf('day');
    const vencimentoInicio = moment(dueDate).startOf('day');
    
    // Empresa está vencida apenas após o dia do vencimento
    return hojeInicio.isAfter(vencimentoInicio, 'day');
  };

  return (
    <TicketsContextProvider>
      <Suspense fallback={<BackdropLoading />}>
        <Switch>
          <Route exact path="/login" component={Login} />
          <Route exact path="/signup" component={Signup} />
          <WhatsAppsProvider>
            <LoggedInLayout hideMenu={isCompanyExpired()}>
                <Route
                  exact
                  path="/financeiro"
                  component={Financeiro}
                  isPrivate
                />

                <Route
                  exact
                  path="/financeiro-aberto"
                  component={Financeiro}
                  isPrivate
                />

                <Route
                  exact
                  path="/companies"
                  component={Companies}
                  isPrivate
                />
                <Route
                  exact
                  path="/birthday-settings"
                  component={BirthdaySettingsPage}
                  isPrivate
                />
                <Route exact path="/" component={Dashboard} isPrivate />
                <Route exact path="/call-historicals" component={CallHistoricals} isPrivate />
                <Route
                  exact
                  path="/tickets/:ticketId?"
                  component={TicketResponsiveContainer}
                  isPrivate
                />
                <Route
                  exact
                  path="/connections"
                  component={Connections}
                  isPrivate
                />
                <Route
                  exact
                  path="/quick-messages"
                  component={QuickMessages}
                  isPrivate
                />
                <Route exact path="/todolist" component={ToDoList} isPrivate />
                <Route
                  exact
                  path="/schedules"
                  component={Schedules}
                  isPrivate
                />
                <Route exact path="/tags" component={Tags} isPrivate />
                <Route exact path="/contacts" component={Contacts} isPrivate />
                <Route
                  exact
                  path="/contacts/import"
                  component={ContactImportPage}
                  isPrivate
                />
                <Route exact path="/wallets" component={Wallets} isPrivate />
                <Route exact path="/helps" component={Helps} isPrivate />
                <Route exact path="/users" component={Users} isPrivate />
                <Route exact path="/on-duty" component={OnDuty} isPrivate />
                <Route
                  exact
                  path="/messages-api"
                  component={MessagesAPI}
                  isPrivate
                />
                <Route
                  exact
                  path="/settings"
                  component={Settings}
                  isPrivate
                />
                <Route exact path="/queues" component={Queues} isPrivate />
                <Route exact path="/reports" component={Reports} isPrivate />
                <Route
                  exact
                  path="/relatorio-vendas"
                  component={RelatorioVendas}
                  isPrivate
                />
                <Route
                  exact
                  path="/queue-integration"
                  component={QueueIntegration}
                  isPrivate
                />
                <Route
                  exact
                  path="/announcements"
                  component={Annoucements}
                  isPrivate
                />
                <Route exact path="/chats/:id?" component={Chat} isPrivate />
                <Route exact path="/files" component={Files} isPrivate />
                <Route
                  exact
                  path="/moments"
                  component={ChatMoments}
                  isPrivate
                />
                <Route exact path="/Kanban" component={Kanban} isPrivate />
                <Route
                  exact
                  path="/TagsKanban"
                  component={TagsKanban}
                  isPrivate
                />
                <Route exact path="/prompts" component={Prompts} isPrivate />
                <Route
                  exact
                  path="/allConnections"
                  component={AllConnections}
                  isPrivate
                />

                <Route
                  exact
                  path="/plugins/floup"
                  component={Floup}
                  isPrivate
                />
                <Route
                  exact
                  path="/plugins/floup/dashboard"
                  component={FloupDashboard}
                  isPrivate
                />

                <Route
                  exact
                  path="/phrase-lists"
                  component={CampaignsPhrase}
                  isPrivate
                />
                <Route
                  exact
                  path="/flowbuilders"
                  component={FlowBuilder}
                  isPrivate
                />
                <Route
                  exact
                  path="/flowbuilder/:id?"
                  component={FlowBuilderConfig}
                  isPrivate
                />

                {showCampaigns && (
                  <>
                    <Route
                      exact
                      path="/contact-lists"
                      component={ContactLists}
                      isPrivate
                    />
                    <Route
                      exact
                      path="/contact-lists/:contactListId/contacts"
                      component={ContactListItems}
                      isPrivate
                    />
                      <Route
                        exact
                        path="/campaigns"
                        component={Campaigns}
                        isPrivate
                      />
                      <Route
                        exact
                        path="/broadcasts"
                        component={Broadcasts}
                        isPrivate
                      />
                      <Route
                      exact
                      path="/campaign/:campaignId/report"
                      component={CampaignReport}
                      isPrivate
                    />
                    <Route
                      exact
                      path="/campaigns-config"
                      component={CampaignsConfig}
                      isPrivate
                    />
                  </>
                )}
              </LoggedInLayout>
            </WhatsAppsProvider>
          </Switch>
        </Suspense>
        <ToastContainer position="top-center" autoClose={3000} />
      </TicketsContextProvider>
  );
};

const Routes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RoutesContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Routes;
