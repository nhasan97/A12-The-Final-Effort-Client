import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSurvey, saveSurveyResponse } from "../api/surveyAPIs";
import { useParams } from "react-router-dom";
import Container from "../components/shared/Container";
import { Helmet } from "react-helmet-async";
import Title from "../components/shared/Title";
import Loading from "../components/shared/Loading";
import timeStampToDateConverter from "../utilities/timeStampToDateConverter";
import useAuth from "../hooks/useAuth";
import {
  showAlertOnError,
  showAlertOnSuccess,
} from "../utilities/displaySweetAlert";
import useResponse from "../hooks/useResponse";

const SurveyDetails = () => {
  const _id = useParams();
  const { user, loading } = useAuth();
  const [responses, loadingResponses, isFetched, refetch] = useResponse(_id);
  let alreadyVoted;
  if (isFetched) {
    alreadyVoted = responses.find(
      (response) => response?.votersEmail === user?.email
    );
    console.log(alreadyVoted);
  }

  const title = {
    mainTitle: "Survey Details",
    subTitle: "Your thoughts...Our drive | Your voice matters",
  };

  const { isLoading, data: survey } = useQuery({
    queryKey: ["getSingleSurveyData"],
    queryFn: () => getSurvey(_id),
  });

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationKey: ["saveResponse"],
    mutationFn: saveSurveyResponse,
    onSuccess: () => {
      showAlertOnSuccess("Inserted successfully!");

      queryClient.invalidateQueries("saveResponse");
    },
    onError: (error) => {
      showAlertOnError(error);
    },
  });

  const handleVote = (e) => {
    e.preventDefault();

    const response = {
      surveyID: survey?._id || "Not Found",
      surveyorEmail: survey?.email || "Not Found",
      votersName: user?.displayName || "Not Found",
      votersEmail: user?.email || "Not Found",
      vote: e.target.rad.value || "Not Found",
      timeStamp: Date.now(),
    };
    mutation.mutate(response);
    refetch();
  };

  if (isLoading || loading || loadingResponses) {
    return <Loading></Loading>;
  }

  return (
    <Container>
      <Helmet>
        <title>PanaPoll | Survey Details</title>
      </Helmet>

      <div className="min-h-screen pt-16 pb-5 ">
        <Title title={title}></Title>
        <div className="flex justify-center items-center gap-6 my-10">
          <div className="w-[50%] flex flex-col justify-center items-center gap-6">
            <div className="w-full p-6 space-y-4 border rounded-lg">
              <h2 className="card-title text-[#71357B] text-2xl">
                {survey?.title}
              </h2>
              <div className="badge bg-[#95D0D4] text-white text-base font-medium">
                {survey?.category}
              </div>
              <p className="text-[#8b8b8b] text-justify">
                {survey?.description}
              </p>

              <h3 className="text-[#8b8b8b] text-justify">
                <span className="text-[#101322] font-medium">Created On: </span>
                {timeStampToDateConverter(survey?.timeStamp)}
              </h3>

              <h3 className="text-[#8b8b8b] text-justify">
                <span className="text-[#101322] font-medium">Expires On: </span>
                {survey?.deadline}
              </h3>

              <div className="join ">
                <button className="btn join-item text-xl w-full">
                  <i className="fa-solid fa-thumbs-up"></i>
                  <span>0</span>
                </button>

                <button className="btn join-item text-xl w-full">
                  <i className="fa-solid fa-thumbs-down"></i>
                  <span>0</span>
                </button>
              </div>
            </div>

            <fieldset className="w-full p-6 space-y-4 border rounded-lg">
              <legend className="text-[#8b8b8b] text-base">
                Let us know your thought
              </legend>
              <form onSubmit={handleVote}>
                <div className="w-full flex ">
                  <div className="flex-1 flex items-center text-xl">
                    <input
                      type="radio"
                      name="rad"
                      id="rad1"
                      value="Yes"
                      required
                      className="radio radio-error"
                    />
                    <label htmlFor="rad1" className="ml-3">
                      Yes
                    </label>
                  </div>
                  <div className="flex-1 flex items-center text-xl">
                    <input
                      type="radio"
                      name="rad"
                      id="rad2"
                      value="No"
                      required
                      className="radio radio-error"
                    />
                    <label htmlFor="rad2" className="ml-3">
                      No
                    </label>
                  </div>
                </div>

                {/* {role === "user" || role === "pro-user" ? ( */}
                {!alreadyVoted ? (
                  <input
                    type="submit"
                    value="Submit"
                    className="w-full btn mt-5 bg-[#FE7E51] hover:bg-white text-lg text-white hover:text-[#FE7E51] border-none"
                  />
                ) : (
                  <input
                    type="submit"
                    value="Submit"
                    disabled
                    className="w-full btn mt-5 bg-[#FE7E51] hover:bg-white text-lg text-white hover:text-[#FE7E51] border-none"
                  />
                )}
              </form>
            </fieldset>
          </div>

          <div className="w-[50%] p-6 space-y-4 border rounded-lg">
            comments
          </div>
        </div>
      </div>
    </Container>
  );
};

export default SurveyDetails;