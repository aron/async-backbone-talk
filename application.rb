require "sinatra"
require "json"

class InvalidJSON < Sinatra::NotFound
end

$tasks = []

before do
  content_type :json
end

not_found do
  {:error => "Task not found"}.to_json
end

error InvalidJSON do
  status 400
  {:error => "Could not parse task JSON"}.to_json
end

helpers do
  def parse_body
    request.body.rewind
    JSON.parse request.body.read rescue raise InvalidJSON
  end

  def get_task_or_404 id
    task = $tasks[id.to_i - 1]
    raise Sinatra::NotFound unless task
    task
  end
end

get "/" do
  content_type :html
  erb :index
end

get "/tasks" do
  $tasks.to_json
end

post "/tasks" do
  task = $tasks.push(parse_body).last
  task[:id] = $tasks.index(task) + 1
  task[:created_at] = Time.now.to_i
  task[:updated_at] = nil
  task.to_json
end

get "/tasks/:id" do
  get_task_or_404(params[:id]).to_json
end

put "/tasks/:id" do
  task = get_task_or_404(params[:id])
  data = parse_body
  data.delete "id"
  data.delete "created_at"
  data[:updated_at] = Time.now.to_i
  task.merge!(data).to_json
end

delete "/tasks/:id" do
  puts "Deleting #{params[:id]}"
  $tasks.delete get_task_or_404(params[:id])
  ""
end
